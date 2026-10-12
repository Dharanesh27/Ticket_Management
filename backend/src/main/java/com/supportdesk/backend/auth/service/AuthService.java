package com.supportdesk.backend.auth.service;

import com.supportdesk.backend.auth.dto.AuthResponse;
import com.supportdesk.backend.auth.dto.LoginRequest;
import com.supportdesk.backend.auth.dto.RegisterRequest;
import com.supportdesk.backend.exception.BadRequestException;
import com.supportdesk.backend.security.JwtTokenProvider;
import com.supportdesk.backend.user.dto.UserDto;
import com.supportdesk.backend.user.entity.Role;
import com.supportdesk.backend.user.entity.User;
import com.supportdesk.backend.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new BadRequestException("An account with email " + request.email() + " already exists");
        }

        // Server strictly assigns ROLE_CUSTOMER for public registration. Never accepts role from request.
        User user = new User(
                request.name().trim(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()),
                Role.ROLE_CUSTOMER
        );

        User savedUser = userRepository.save(user);

        // Authenticate immediately and return JWT token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );

        String token = jwtTokenProvider.generateToken(authentication);
        return new AuthResponse(token, UserDto.fromEntity(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );

        String token = jwtTokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!user.isActive()) {
            throw new BadRequestException("User account is inactive. Please contact support.");
        }

        return new AuthResponse(token, UserDto.fromEntity(user));
    }
}
