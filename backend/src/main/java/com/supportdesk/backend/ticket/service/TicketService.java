package com.supportdesk.backend.ticket.service;

import com.supportdesk.backend.common.PageResponse;
import com.supportdesk.backend.exception.BadRequestException;
import com.supportdesk.backend.exception.ForbiddenException;
import com.supportdesk.backend.exception.ResourceNotFoundException;
import com.supportdesk.backend.history.service.TicketHistoryService;
import com.supportdesk.backend.ticket.dto.*;
import com.supportdesk.backend.ticket.entity.Ticket;
import com.supportdesk.backend.ticket.entity.TicketCategory;
import com.supportdesk.backend.ticket.entity.TicketPriority;
import com.supportdesk.backend.ticket.entity.TicketStatus;
import com.supportdesk.backend.ticket.repository.TicketRepository;
import com.supportdesk.backend.user.entity.Role;
import com.supportdesk.backend.user.entity.User;
import com.supportdesk.backend.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class TicketService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "ticketNumber", "title", "category", "priority", "status", "createdAt", "updatedAt"
    );

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketHistoryService ticketHistoryService;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         TicketHistoryService ticketHistoryService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.ticketHistoryService = ticketHistoryService;
    }

    // --- Helper Methods ---
    private Pageable createPageable(int page, int size, String sortBy, String direction) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "createdAt";
        }
        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
    }

    private String generateTicketNumber() {
        return "TCK-" + System.currentTimeMillis() + "-" + (int) (Math.random() * 900 + 100);
    }

    // --- Customer Operations ---
    @Transactional
    public TicketDto createTicket(CreateTicketRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Ticket ticket = new Ticket(
                generateTicketNumber(),
                request.title().trim(),
                request.description().trim(),
                request.category(),
                request.priority(),
                customer
        );

        Ticket savedTicket = ticketRepository.save(ticket);

        ticketHistoryService.recordAction(
                savedTicket, customer, "CREATED", null, "Created ticket with status OPEN"
        );

        return TicketDto.fromEntity(savedTicket);
    }

    @Transactional(readOnly = true)
    public PageResponse<TicketDto> getCustomerTickets(
            String customerEmail, TicketStatus status, TicketCategory category, TicketPriority priority,
            String search, int page, int size, String sortBy, String direction) {

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Pageable pageable = createPageable(page, size, sortBy, direction);
        Page<Ticket> ticketPage = ticketRepository.findCustomerTickets(
                customer.getId(), status, category, priority, search, pageable
        );

        return PageResponse.of(ticketPage.map(TicketDto::fromEntity));
    }

    @Transactional
    public TicketDto updateCustomerTicket(Long id, UpdateTicketRequest request, String customerEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!ticket.getCustomer().getId().equals(customer.getId())) {
            throw new ForbiddenException("You cannot modify another customer's ticket");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Closed tickets cannot be modified");
        }

        if (request.title() != null && !request.title().isBlank()) {
            ticket.setTitle(request.title().trim());
        }
        if (request.description() != null && !request.description().isBlank()) {
            ticket.setDescription(request.description().trim());
        }
        if (request.category() != null) {
            ticket.setCategory(request.category());
        }
        if (request.priority() != null) {
            ticket.setPriority(request.priority());
        }

        Ticket updated = ticketRepository.save(ticket);
        ticketHistoryService.recordAction(
                updated, customer, "UPDATED", null, "Customer updated ticket details"
        );

        return TicketDto.fromEntity(updated);
    }

    // --- Agent Operations ---
    @Transactional(readOnly = true)
    public PageResponse<TicketDto> getAgentTickets(
            String agentEmail, TicketStatus status, TicketCategory category, TicketPriority priority,
            String search, int page, int size, String sortBy, String direction) {

        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        Pageable pageable = createPageable(page, size, sortBy, direction);
        Page<Ticket> ticketPage = ticketRepository.findAgentTickets(
                agent.getId(), status, category, priority, search, pageable
        );

        return PageResponse.of(ticketPage.map(TicketDto::fromEntity));
    }

    @Transactional(readOnly = true)
    public PageResponse<TicketDto> getUnassignedTickets(
            TicketCategory category, TicketPriority priority, String search,
            int page, int size, String sortBy, String direction) {

        Pageable pageable = createPageable(page, size, sortBy, direction);
        Page<Ticket> ticketPage = ticketRepository.findUnassignedTickets(category, priority, search, pageable);
        return PageResponse.of(ticketPage.map(TicketDto::fromEntity));
    }

    @Transactional
    public TicketDto claimTicket(Long id, String agentEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        if (ticket.getAssignedAgent() != null) {
            throw new BadRequestException("This ticket is already assigned to agent: " + ticket.getAssignedAgent().getName());
        }

        ticket.setAssignedAgent(agent);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        Ticket updated = ticketRepository.save(ticket);

        ticketHistoryService.recordAction(
                updated, agent, "CLAIMED", "Unassigned", "Claimed by " + agent.getName()
        );

        return TicketDto.fromEntity(updated);
    }

    @Transactional
    public TicketDto updateAgentStatus(Long id, TicketStatus newStatus, String agentEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        if (ticket.getAssignedAgent() == null || !ticket.getAssignedAgent().getId().equals(agent.getId())) {
            throw new ForbiddenException("You can only change status on tickets assigned to you");
        }

        TicketStatus currentStatus = ticket.getStatus();
        if (!currentStatus.canTransitionTo(newStatus, false)) {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        ticket.setStatus(newStatus);
        Ticket updated = ticketRepository.save(ticket);

        ticketHistoryService.recordAction(
                updated, agent, "STATUS_CHANGE", currentStatus.name(), newStatus.name()
        );

        return TicketDto.fromEntity(updated);
    }

    // --- Admin Operations ---
    @Transactional(readOnly = true)
    public PageResponse<TicketDto> getAllTickets(
            TicketStatus status, TicketCategory category, TicketPriority priority, Long agentId,
            String search, int page, int size, String sortBy, String direction) {

        Pageable pageable = createPageable(page, size, sortBy, direction);
        Page<Ticket> ticketPage = ticketRepository.findAllTicketsFiltered(
                status, category, priority, agentId, search, pageable
        );

        return PageResponse.of(ticketPage.map(TicketDto::fromEntity));
    }

    @Transactional
    public TicketDto assignTicket(Long id, Long agentId, String adminEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found with id: " + agentId));

        if (agent.getRole() != Role.ROLE_AGENT) {
            throw new BadRequestException("User " + agent.getName() + " is not an AGENT");
        }

        if (!agent.isActive()) {
            throw new BadRequestException("Cannot assign ticket to inactive agent");
        }

        String prevAgent = ticket.getAssignedAgent() != null ? ticket.getAssignedAgent().getName() : "Unassigned";
        ticket.setAssignedAgent(agent);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        Ticket updated = ticketRepository.save(ticket);

        ticketHistoryService.recordAction(
                updated, admin, "ASSIGNED", prevAgent, "Assigned to " + agent.getName()
        );

        return TicketDto.fromEntity(updated);
    }

    @Transactional
    public TicketDto updateAdminStatus(Long id, TicketStatus newStatus, String adminEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        TicketStatus currentStatus = ticket.getStatus();
        if (!currentStatus.canTransitionTo(newStatus, true)) {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        ticket.setStatus(newStatus);
        Ticket updated = ticketRepository.save(ticket);

        ticketHistoryService.recordAction(
                updated, admin, "STATUS_CHANGE", currentStatus.name(), newStatus.name()
        );

        return TicketDto.fromEntity(updated);
    }

    // --- Shared Operations & Security Isolation ---
    @Transactional(readOnly = true)
    public TicketDto getTicketById(Long id, String userEmail) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ROLE_CUSTOMER) {
            if (!ticket.getCustomer().getId().equals(user.getId())) {
                throw new ForbiddenException("You are not authorized to view another customer's ticket");
            }
        }

        return TicketDto.fromEntity(ticket);
    }

    // --- Dashboard Statistics ---
    @Transactional(readOnly = true)
    public DashboardStatsDto.CustomerStats getCustomerStats(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        long total = ticketRepository.countByCustomerId(customer.getId());
        long open = ticketRepository.countByCustomerIdAndStatus(customer.getId(), TicketStatus.OPEN);
        long inProgress = ticketRepository.countByCustomerIdAndStatus(customer.getId(), TicketStatus.IN_PROGRESS);
        long resolved = ticketRepository.countByCustomerIdAndStatus(customer.getId(), TicketStatus.RESOLVED);
        long closed = ticketRepository.countByCustomerIdAndStatus(customer.getId(), TicketStatus.CLOSED);

        List<TicketDto> recent = ticketRepository.findTop5ByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(TicketDto::fromEntity)
                .toList();

        return new DashboardStatsDto.CustomerStats(total, open, inProgress, resolved, closed, recent);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto.AgentStats getAgentStats(String agentEmail) {
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        long assigned = ticketRepository.countByAssignedAgentId(agent.getId());
        long open = ticketRepository.countByAssignedAgentIdAndStatus(agent.getId(), TicketStatus.OPEN);
        long inProgress = ticketRepository.countByAssignedAgentIdAndStatus(agent.getId(), TicketStatus.IN_PROGRESS);
        long resolved = ticketRepository.countByAssignedAgentIdAndStatus(agent.getId(), TicketStatus.RESOLVED);
        long unassigned = ticketRepository.countByAssignedAgentIsNullAndStatus(TicketStatus.OPEN);

        List<TicketDto> recent = ticketRepository.findTop5ByAssignedAgentIdOrderByUpdatedAtDesc(agent.getId()).stream()
                .map(TicketDto::fromEntity)
                .toList();

        return new DashboardStatsDto.AgentStats(assigned, open, inProgress, resolved, unassigned, recent);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto.AdminStats getAdminStats() {
        long total = ticketRepository.count();
        long open = ticketRepository.countByStatus(TicketStatus.OPEN);
        long inProgress = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long resolved = ticketRepository.countByStatus(TicketStatus.RESOLVED);
        long closed = ticketRepository.countByStatus(TicketStatus.CLOSED);
        long unassigned = ticketRepository.countByAssignedAgentIsNullAndStatus(TicketStatus.OPEN);

        Map<String, Long> statusDistribution = new LinkedHashMap<>();
        statusDistribution.put("OPEN", open);
        statusDistribution.put("IN_PROGRESS", inProgress);
        statusDistribution.put("RESOLVED", resolved);
        statusDistribution.put("CLOSED", closed);

        Map<String, Long> priorityDistribution = new LinkedHashMap<>();
        for (TicketPriority p : TicketPriority.values()) {
            priorityDistribution.put(p.name(), ticketRepository.countByPriority(p));
        }

        List<User> agents = userRepository.findByRole(Role.ROLE_AGENT);
        List<DashboardStatsDto.AgentWorkload> workloads = new ArrayList<>();
        for (User agent : agents) {
            long agentAssigned = ticketRepository.countByAssignedAgentId(agent.getId());
            long agentOpen = ticketRepository.countByAssignedAgentIdAndStatus(agent.getId(), TicketStatus.OPEN);
            long agentInProgress = ticketRepository.countByAssignedAgentIdAndStatus(agent.getId(), TicketStatus.IN_PROGRESS);
            workloads.add(new DashboardStatsDto.AgentWorkload(
                    agent.getId(), agent.getName(), agentAssigned, agentOpen, agentInProgress
            ));
        }

        List<TicketDto> recent = ticketRepository.findTop10ByOrderByUpdatedAtDesc().stream()
                .map(TicketDto::fromEntity)
                .toList();

        return new DashboardStatsDto.AdminStats(
                total, open, inProgress, resolved, closed, unassigned,
                statusDistribution, priorityDistribution, workloads, recent
        );
    }
}
