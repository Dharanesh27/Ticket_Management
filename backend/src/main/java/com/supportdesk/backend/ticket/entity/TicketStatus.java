package com.supportdesk.backend.ticket.entity;

import java.util.Set;

public enum TicketStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED;

    public boolean canTransitionTo(TicketStatus newStatus, boolean isAdmin) {
        if (this == newStatus) {
            return true;
        }

        return switch (this) {
            case OPEN -> newStatus == IN_PROGRESS || (isAdmin && newStatus == CLOSED);
            case IN_PROGRESS -> newStatus == RESOLVED || (isAdmin && newStatus == CLOSED);
            case RESOLVED -> newStatus == CLOSED || (isAdmin && newStatus == IN_PROGRESS); // Admin can reopen
            case CLOSED -> false; // Closed tickets are terminal
        };
    }
}
