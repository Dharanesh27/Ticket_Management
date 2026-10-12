package com.supportdesk.backend.user.controller;

import com.supportdesk.backend.auth.dto.RegisterRequest;
import com.supportdesk.backend.user.dto.UserDto;
import com.supportdesk.backend.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/agents")
    public ResponseEntity<List<UserDto>> getActiveAgents() {
        return ResponseEntity.ok(userService.getActiveAgents());
    }

    @PostMapping("/agents")
    public ResponseEntity<UserDto> createAgent(@Valid @RequestBody RegisterRequest request) {
        UserDto agent = userService.createAgent(request.name(), request.email(), request.password());
        return new ResponseEntity<>(agent, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<UserDto> toggleUserActiveStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Boolean active = body.get("active");
        if (active == null) {
            throw new IllegalArgumentException("'active' field is required");
        }

        UserDto updated = userService.updateUserActiveStatus(id, active, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }
}
