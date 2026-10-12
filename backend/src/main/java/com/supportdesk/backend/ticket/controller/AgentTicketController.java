package com.supportdesk.backend.ticket.controller;

import com.supportdesk.backend.common.PageResponse;
import com.supportdesk.backend.ticket.dto.DashboardStatsDto;
import com.supportdesk.backend.ticket.dto.StatusUpdateRequest;
import com.supportdesk.backend.ticket.dto.TicketDto;
import com.supportdesk.backend.ticket.entity.TicketCategory;
import com.supportdesk.backend.ticket.entity.TicketPriority;
import com.supportdesk.backend.ticket.entity.TicketStatus;
import com.supportdesk.backend.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
@PreAuthorize("hasAnyAuthority('ROLE_AGENT', 'ROLE_ADMIN')")
public class AgentTicketController {

    private final TicketService ticketService;

    public AgentTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/tickets")
    public ResponseEntity<PageResponse<TicketDto>> getAssignedTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @AuthenticationPrincipal UserDetails userDetails) {

        PageResponse<TicketDto> tickets = ticketService.getAgentTickets(
                userDetails.getUsername(), status, category, priority, search, page, size, sortBy, direction
        );
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/tickets/unassigned")
    public ResponseEntity<PageResponse<TicketDto>> getUnassignedTickets(
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        PageResponse<TicketDto> tickets = ticketService.getUnassignedTickets(
                category, priority, search, page, size, sortBy, direction
        );
        return ResponseEntity.ok(tickets);
    }

    @PostMapping("/tickets/{id}/claim")
    public ResponseEntity<TicketDto> claimTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.claimTicket(id, userDetails.getUsername()));
    }

    @PatchMapping("/tickets/{id}/status")
    public ResponseEntity<TicketDto> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.updateAgentStatus(id, request.status(), userDetails.getUsername()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDto.AgentStats> getAgentDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.getAgentStats(userDetails.getUsername()));
    }
}
