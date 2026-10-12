package com.supportdesk.backend.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(
        @NotBlank(message = "Comment message cannot be empty")
        @Size(min = 1, max = 3000, message = "Comment message cannot exceed 3000 characters")
        String message,

        boolean internalNote
) {}
