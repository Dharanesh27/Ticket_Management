package com.supportdesk.backend.comment.dto;

import com.supportdesk.backend.comment.entity.Comment;
import com.supportdesk.backend.user.dto.UserDto;

import java.time.LocalDateTime;

public record CommentDto(
        Long id,
        Long ticketId,
        UserDto author,
        String message,
        boolean internalNote,
        LocalDateTime createdAt
) {
    public static CommentDto fromEntity(Comment comment) {
        if (comment == null) {
            return null;
        }
        return new CommentDto(
                comment.getId(),
                comment.getTicket().getId(),
                UserDto.fromEntity(comment.getAuthor()),
                comment.getMessage(),
                comment.isInternalNote(),
                comment.getCreatedAt()
        );
    }
}
