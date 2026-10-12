package com.supportdesk.backend.history.dto;

import com.supportdesk.backend.history.entity.TicketHistory;
import com.supportdesk.backend.user.dto.UserDto;

import java.time.LocalDateTime;

public record TicketHistoryDto(
        Long id,
        Long ticketId,
        UserDto actor,
        String actionType,
        String previousValue,
        String newValue,
        LocalDateTime timestamp
) {
    public static TicketHistoryDto fromEntity(TicketHistory history) {
        if (history == null) {
            return null;
        }
        return new TicketHistoryDto(
                history.getId(),
                history.getTicket().getId(),
                UserDto.fromEntity(history.getActor()),
                history.getActionType(),
                history.getPreviousValue(),
                history.getNewValue(),
                history.getTimestamp()
        );
    }
}
