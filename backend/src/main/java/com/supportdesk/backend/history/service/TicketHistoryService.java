package com.supportdesk.backend.history.service;

import com.supportdesk.backend.history.dto.TicketHistoryDto;
import com.supportdesk.backend.history.entity.TicketHistory;
import com.supportdesk.backend.history.repository.TicketHistoryRepository;
import com.supportdesk.backend.ticket.entity.Ticket;
import com.supportdesk.backend.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TicketHistoryService {

    private final TicketHistoryRepository historyRepository;

    public TicketHistoryService(TicketHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Transactional
    public void recordAction(Ticket ticket, User actor, String actionType, String previousValue, String newValue) {
        TicketHistory history = new TicketHistory(ticket, actor, actionType, previousValue, newValue);
        historyRepository.save(history);
    }

    @Transactional(readOnly = true)
    public List<TicketHistoryDto> getHistoryForTicket(Long ticketId) {
        return historyRepository.findByTicketIdOrderByTimestampDesc(ticketId).stream()
                .map(TicketHistoryDto::fromEntity)
                .toList();
    }
}
