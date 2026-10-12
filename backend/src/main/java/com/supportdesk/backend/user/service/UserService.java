package com.supportdesk.backend.user.service;

import com.supportdesk.backend.exception.BadRequestException;
import com.supportdesk.backend.exception.ResourceNotFoundException;
import com.supportdesk.backend.user.dto.UserDto;
import com.supportdesk.backend.user.entity.Role;
import com.supportdesk.backend.user.entity.User;
import com.supportdesk.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDto> getActiveAgents() {
        return userRepository.findByRoleAndActive(Role.ROLE_AGENT, true).stream()
                .map(UserDto::fromEntity)
                .toList();
    }

    @Transactional
    public UserDto updateUserActiveStatus(Long id, boolean active, String actorEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Prevent admin from deactivating themselves
        if (user.getEmail().equalsIgnoreCase(actorEmail)) {
            throw new BadRequestException("Administrators cannot deactivate their own account");
        }

        user.setActive(active);
        User updated = userRepository.save(user);
        return UserDto.fromEntity(updated);
    }

    @Transactional
    public UserDto createAgent(String name, String email, String password) {
        if (userRepository.existsByEmail(email.trim().toLowerCase())) {
            throw new BadRequestException("User already exists with email: " + email);
        }

        User agent = new User(
                name.trim(),
                email.trim().toLowerCase(),
                passwordEncoder.encode(password),
                Role.ROLE_AGENT
        );

        User saved = userRepository.save(agent);
        return UserDto.fromEntity(saved);
    }
}
