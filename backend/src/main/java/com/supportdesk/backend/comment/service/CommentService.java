package com.supportdesk.backend.comment.service;

import com.supportdesk.backend.comment.dto.CommentDto;
import com.supportdesk.backend.comment.dto.CreateCommentRequest;
import com.supportdesk.backend.comment.entity.Comment;
import com.supportdesk.backend.comment.repository.CommentRepository;
import com.supportdesk.backend.exception.BadRequestException;
import com.supportdesk.backend.exception.ForbiddenException;
import com.supportdesk.backend.exception.ResourceNotFoundException;
import com.supportdesk.backend.ticket.entity.Ticket;
import com.supportdesk.backend.ticket.entity.TicketStatus;
import com.supportdesk.backend.ticket.repository.TicketRepository;
import com.supportdesk.backend.user.entity.Role;
import com.supportdesk.backend.user.entity.User;
import com.supportdesk.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
                          TicketRepository ticketRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CommentDto addComment(Long ticketId, CreateCommentRequest request, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Cannot add comments to a closed ticket");
        }

        // Customer permissions check
        if (user.getRole() == Role.ROLE_CUSTOMER) {
            if (!ticket.getCustomer().getId().equals(user.getId())) {
                throw new ForbiddenException("You cannot comment on another customer's ticket");
            }
            if (request.internalNote()) {
                throw new ForbiddenException("Customers cannot add internal notes");
            }
        }

        // Agent permissions check
        if (user.getRole() == Role.ROLE_AGENT) {
            boolean isAssigned = ticket.getAssignedAgent() != null && ticket.getAssignedAgent().getId().equals(user.getId());
            if (!isAssigned) {
                throw new ForbiddenException("Agents can only comment on tickets assigned to them");
            }
        }

        boolean internalNote = (user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_AGENT) && request.internalNote();

        Comment comment = new Comment(
                ticket,
                user,
                request.message().trim(),
                internalNote
        );

        Comment saved = commentRepository.save(comment);
        return CommentDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getCommentsForTicket(Long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ROLE_CUSTOMER) {
            if (!ticket.getCustomer().getId().equals(user.getId())) {
                throw new ForbiddenException("You cannot view comments on another customer's ticket");
            }
            // Customers only see non-internal comments
            return commentRepository.findByTicketIdAndInternalNoteFalseOrderByCreatedAtAsc(ticketId).stream()
                    .map(CommentDto::fromEntity)
                    .toList();
        }

        // Agents and Admins see all comments including internal notes
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(CommentDto::fromEntity)
                .toList();
    }
}
