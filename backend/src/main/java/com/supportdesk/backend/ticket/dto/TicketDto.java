package com.supportdesk.backend.ticket.dto;

import com.supportdesk.backend.ticket.entity.Ticket;
import com.supportdesk.backend.ticket.entity.TicketCategory;
import com.supportdesk.backend.ticket.entity.TicketPriority;
import com.supportdesk.backend.ticket.entity.TicketStatus;
import com.supportdesk.backend.user.dto.UserDto;

import java.time.LocalDateTime;

public record TicketDto(
        Long id,
        String ticketNumber,
        String title,
        String description,
        TicketCategory category,
        TicketPriority priority,
        TicketStatus status,
        UserDto customer,
        UserDto assignedAgent,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt
) {
    public static TicketDto fromEntity(Ticket ticket) {
        if (ticket == null) {
            return null;
        }
        return new TicketDto(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),
                UserDto.fromEntity(ticket.getCustomer()),
                UserDto.fromEntity(ticket.getAssignedAgent()),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getResolvedAt()
        );
    }
}
