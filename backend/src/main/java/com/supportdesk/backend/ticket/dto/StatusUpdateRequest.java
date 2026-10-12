package com.supportdesk.backend.ticket.dto;

import com.supportdesk.backend.ticket.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Status is required")
        TicketStatus status
) {}
