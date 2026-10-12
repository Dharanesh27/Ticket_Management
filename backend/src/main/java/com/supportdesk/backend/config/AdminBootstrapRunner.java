package com.supportdesk.backend.config;

import com.supportdesk.backend.user.entity.Role;
import com.supportdesk.backend.user.entity.User;
import com.supportdesk.backend.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;

    public AdminBootstrapRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.email}") String adminEmail,
            @Value("${app.bootstrap.admin.password}") String adminPassword,
            @Value("${app.bootstrap.admin.name}") String adminName) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminName = adminName;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByRole(Role.ROLE_ADMIN).isEmpty()) {
            logger.info("No administrator found in database. Initializing bootstrap admin account: {}", adminEmail);

            User admin = new User(
                    adminName,
                    adminEmail.trim().toLowerCase(),
                    passwordEncoder.encode(adminPassword),
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);
            logger.info("Administrator account created successfully.");
        } else {
            logger.info("Administrator account already exists. Skipping bootstrap initialization.");
        }
    }
}
