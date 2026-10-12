package com.supportdesk.backend.user.dto;

import com.supportdesk.backend.user.entity.Role;
import com.supportdesk.backend.user.entity.User;

import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String name,
        String email,
        Role role,
        boolean active,
        LocalDateTime createdAt
) {
    public static UserDto fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
