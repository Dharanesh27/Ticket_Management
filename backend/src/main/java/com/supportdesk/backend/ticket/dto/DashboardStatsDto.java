package com.supportdesk.backend.ticket.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    public record CustomerStats(
            long totalTickets,
            long openTickets,
            long inProgressTickets,
            long resolvedTickets,
            long closedTickets,
            List<TicketDto> recentTickets
    ) {}

    public record AgentStats(
            long assignedTickets,
            long openAssignedTickets,
            long inProgressAssignedTickets,
            long resolvedAssignedTickets,
            long unassignedClaimableTickets,
            List<TicketDto> recentTickets
    ) {}

    public record AdminStats(
            long totalTickets,
            long openTickets,
            long inProgressTickets,
            long resolvedTickets,
            long closedTickets,
            long unassignedTickets,
            Map<String, Long> statusDistribution,
            Map<String, Long> priorityDistribution,
            List<AgentWorkload> agentWorkload,
            List<TicketDto> recentActivity
    ) {}

    public record AgentWorkload(
            Long agentId,
            String agentName,
            long assignedCount,
            long openCount,
            long inProgressCount
    ) {}
}
