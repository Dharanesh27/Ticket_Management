package com.supportdesk.backend.ticket.dto;

import com.supportdesk.backend.ticket.entity.TicketCategory;
import com.supportdesk.backend.ticket.entity.TicketPriority;
import jakarta.validation.constraints.Size;

public record UpdateTicketRequest(
        @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
        String title,

        @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
        String description,

        TicketCategory category,
        TicketPriority priority
) {}
