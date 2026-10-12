package com.supportdesk.backend.ticket.controller;

import com.supportdesk.backend.comment.dto.CommentDto;
import com.supportdesk.backend.comment.dto.CreateCommentRequest;
import com.supportdesk.backend.comment.service.CommentService;
import com.supportdesk.backend.common.PageResponse;
import com.supportdesk.backend.history.dto.TicketHistoryDto;
import com.supportdesk.backend.history.service.TicketHistoryService;
import com.supportdesk.backend.ticket.dto.*;
import com.supportdesk.backend.ticket.entity.TicketCategory;
import com.supportdesk.backend.ticket.entity.TicketPriority;
import com.supportdesk.backend.ticket.entity.TicketStatus;
import com.supportdesk.backend.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final CommentService commentService;
    private final TicketHistoryService ticketHistoryService;

    public TicketController(TicketService ticketService,
                            CommentService commentService,
                            TicketHistoryService ticketHistoryService) {
        this.ticketService = ticketService;
        this.commentService = commentService;
        this.ticketHistoryService = ticketHistoryService;
    }

    // Customer: Create Ticket
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<TicketDto> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketDto ticket = ticketService.createTicket(request, userDetails.getUsername());
        return new ResponseEntity<>(ticket, HttpStatus.CREATED);
    }

    // Customer: View my tickets
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<PageResponse<TicketDto>> getMyTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        PageResponse<TicketDto> tickets = ticketService.getCustomerTickets(
                userDetails.getUsername(), status, category, priority, search, page, size, sortBy, direction
        );
        return ResponseEntity.ok(tickets);
    }

    // Customer Dashboard stats
    @GetMapping("/my/dashboard")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<DashboardStatsDto.CustomerStats> getCustomerDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.getCustomerStats(userDetails.getUsername()));
    }

    // Shared: View Ticket Details
    @GetMapping("/{id}")
    public ResponseEntity<TicketDto> getTicketById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.getTicketById(id, userDetails.getUsername()));
    }

    // Customer: Update Ticket
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<TicketDto> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.updateCustomerTicket(id, request, userDetails.getUsername()));
    }

    // Comments: Add comment to ticket
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        CommentDto comment = commentService.addComment(id, request, userDetails.getUsername());
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    // Comments: List comments for ticket
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDto>> getComments(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(commentService.getCommentsForTicket(id, userDetails.getUsername()));
    }

    // History: List audit history for ticket
    @GetMapping("/{id}/history")
    public ResponseEntity<List<TicketHistoryDto>> getTicketHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Enforce ownership check before displaying history
        ticketService.getTicketById(id, userDetails.getUsername());
        return ResponseEntity.ok(ticketHistoryService.getHistoryForTicket(id));
    }
}
