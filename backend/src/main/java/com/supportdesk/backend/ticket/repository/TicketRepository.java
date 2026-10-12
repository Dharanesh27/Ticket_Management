package com.supportdesk.backend.ticket.repository;

import com.supportdesk.backend.ticket.entity.Ticket;
import com.supportdesk.backend.ticket.entity.TicketCategory;
import com.supportdesk.backend.ticket.entity.TicketPriority;
import com.supportdesk.backend.ticket.entity.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    // Filter tickets for Customer
    @Query("SELECT t FROM Ticket t WHERE t.customer.id = :customerId " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.ticketNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> findCustomerTickets(
            @Param("customerId") Long customerId,
            @Param("status") TicketStatus status,
            @Param("category") TicketCategory category,
            @Param("priority") TicketPriority priority,
            @Param("search") String search,
            Pageable pageable);

    // Filter tickets assigned to an Agent
    @Query("SELECT t FROM Ticket t WHERE t.assignedAgent.id = :agentId " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.ticketNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> findAgentTickets(
            @Param("agentId") Long agentId,
            @Param("status") TicketStatus status,
            @Param("category") TicketCategory category,
            @Param("priority") TicketPriority priority,
            @Param("search") String search,
            Pageable pageable);

    // Filter unassigned tickets for Agents to claim
    @Query("SELECT t FROM Ticket t WHERE t.assignedAgent IS NULL AND t.status = 'OPEN' " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.ticketNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> findUnassignedTickets(
            @Param("category") TicketCategory category,
            @Param("priority") TicketPriority priority,
            @Param("search") String search,
            Pageable pageable);

    // Filter all tickets for Admin
    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:agentId IS NULL OR (t.assignedAgent IS NOT NULL AND t.assignedAgent.id = :agentId)) " +
           "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.ticketNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> findAllTicketsFiltered(
            @Param("status") TicketStatus status,
            @Param("category") TicketCategory category,
            @Param("priority") TicketPriority priority,
            @Param("agentId") Long agentId,
            @Param("search") String search,
            Pageable pageable);

    // Counting helpers for stats and dashboards
    long countByCustomerId(Long customerId);
    long countByCustomerIdAndStatus(Long customerId, TicketStatus status);

    long countByAssignedAgentId(Long agentId);
    long countByAssignedAgentIdAndStatus(Long agentId, TicketStatus status);

    long countByStatus(TicketStatus status);
    long countByPriority(TicketPriority priority);
    long countByAssignedAgentIsNullAndStatus(TicketStatus status);

    List<Ticket> findTop5ByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Ticket> findTop5ByAssignedAgentIdOrderByUpdatedAtDesc(Long agentId);
    List<Ticket> findTop10ByOrderByUpdatedAtDesc();
}
