package com.supportdesk.backend.ticket;

import com.supportdesk.backend.ticket.entity.TicketStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TicketStatusTransitionTest {

    @Test
    @DisplayName("OPEN can transition to IN_PROGRESS for agents and admins")
    void testOpenToInProgress() {
        assertTrue(TicketStatus.OPEN.canTransitionTo(TicketStatus.IN_PROGRESS, false));
        assertTrue(TicketStatus.OPEN.canTransitionTo(TicketStatus.IN_PROGRESS, true));
    }

    @Test
    @DisplayName("OPEN cannot transition directly to RESOLVED without going through IN_PROGRESS")
    void testOpenToResolvedForbidden() {
        assertFalse(TicketStatus.OPEN.canTransitionTo(TicketStatus.RESOLVED, false));
        assertFalse(TicketStatus.OPEN.canTransitionTo(TicketStatus.RESOLVED, true));
    }

    @Test
    @DisplayName("Admin can directly CLOSE an OPEN ticket, but an Agent cannot")
    void testOpenToClosedOnlyAdmin() {
        assertFalse(TicketStatus.OPEN.canTransitionTo(TicketStatus.CLOSED, false));
        assertTrue(TicketStatus.OPEN.canTransitionTo(TicketStatus.CLOSED, true));
    }

    @Test
    @DisplayName("IN_PROGRESS can transition to RESOLVED")
    void testInProgressToResolved() {
        assertTrue(TicketStatus.IN_PROGRESS.canTransitionTo(TicketStatus.RESOLVED, false));
        assertTrue(TicketStatus.IN_PROGRESS.canTransitionTo(TicketStatus.RESOLVED, true));
    }

    @Test
    @DisplayName("RESOLVED can be CLOSED, and only Admin can reopen to IN_PROGRESS")
    void testResolvedTransitions() {
        assertTrue(TicketStatus.RESOLVED.canTransitionTo(TicketStatus.CLOSED, false));
        assertTrue(TicketStatus.RESOLVED.canTransitionTo(TicketStatus.CLOSED, true));

        // Reopening:
        assertFalse(TicketStatus.RESOLVED.canTransitionTo(TicketStatus.IN_PROGRESS, false));
        assertTrue(TicketStatus.RESOLVED.canTransitionTo(TicketStatus.IN_PROGRESS, true));
    }

    @Test
    @DisplayName("CLOSED tickets are terminal and cannot transition to anything else")
    void testClosedIsTerminal() {
        assertFalse(TicketStatus.CLOSED.canTransitionTo(TicketStatus.OPEN, true));
        assertFalse(TicketStatus.CLOSED.canTransitionTo(TicketStatus.IN_PROGRESS, true));
        assertFalse(TicketStatus.CLOSED.canTransitionTo(TicketStatus.RESOLVED, true));
    }
}
