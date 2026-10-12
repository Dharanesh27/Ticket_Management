package com.supportdesk.backend.ticket.controller;

import com.supportdesk.backend.common.PageResponse;
import com.supportdesk.backend.ticket.dto.AssignTicketRequest;
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
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminTicketController {

    private final TicketService ticketService;

    public AdminTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/tickets")
    public ResponseEntity<PageResponse<TicketDto>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long agentId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        PageResponse<TicketDto> tickets = ticketService.getAllTickets(
                status, category, priority, agentId, search, page, size, sortBy, direction
        );
        return ResponseEntity.ok(tickets);
    }

    @PatchMapping("/tickets/{id}/assign")
    public ResponseEntity<TicketDto> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request.agentId(), userDetails.getUsername()));
    }

    @PatchMapping("/tickets/{id}/status")
    public ResponseEntity<TicketDto> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ticketService.updateAdminStatus(id, request.status(), userDetails.getUsername()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDto.AdminStats> getAdminDashboard() {
        return ResponseEntity.ok(ticketService.getAdminStats());
    }
}
