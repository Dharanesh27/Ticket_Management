package com.supportdesk.backend.auth.dto;

import com.supportdesk.backend.user.dto.UserDto;

public record AuthResponse(
        String token,
        String tokenType,
        UserDto user
) {
    public AuthResponse(String token, UserDto user) {
        this(token, "Bearer", user);
    }
}
