package com.supportdesk.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.supportdesk.backend.auth.dto.LoginRequest;
import com.supportdesk.backend.auth.dto.RegisterRequest;
import com.supportdesk.backend.ticket.dto.CreateTicketRequest;
import com.supportdesk.backend.ticket.entity.TicketCategory;
import com.supportdesk.backend.ticket.entity.TicketPriority;
import com.supportdesk.backend.user.entity.Role;
import com.supportdesk.backend.user.entity.User;
import com.supportdesk.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAndAuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        // Seed bootstrap admin
        User admin = new User("Admin User", "admin@test.com", passwordEncoder.encode("AdminPass123!"), Role.ROLE_ADMIN);
        userRepository.save(admin);

        // Seed an Agent
        User agent = new User("Support Agent", "agent@test.com", passwordEncoder.encode("AgentPass123!"), Role.ROLE_AGENT);
        userRepository.save(agent);
    }

    @Test
    @DisplayName("Health endpoint is public and returns 200 UP")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @DisplayName("Customer registration always creates ROLE_CUSTOMER and returns token")
    void testCustomerRegistration() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("Alice Smith", "alice@test.com", "Password123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("alice@test.com"))
                .andExpect(jsonPath("$.user.role").value("ROLE_CUSTOMER"));
    }

    @Test
    @DisplayName("Duplicate registration is rejected with 400 Bad Request")
    void testDuplicateRegistration() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("Admin Clone", "admin@test.com", "Password123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("An account with email admin@test.com already exists"));
    }

    @Test
    @DisplayName("Unauthenticated request to protected endpoint returns 401 Unauthorized")
    void testUnauthenticatedAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Customer cannot access Admin-only endpoints, returns 403 Forbidden")
    void testCustomerCannotAccessAdminEndpoint() throws Exception {
        // 1. Register customer
        RegisterRequest registerReq = new RegisterRequest("Bob Customer", "bob@test.com", "Password123!");
        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = regResult.getResponse().getContentAsString();
        String customerToken = objectMapper.readTree(responseBody).get("token").asText();

        // 2. Customer attempts to access Admin endpoint
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer can create ticket and view their own tickets")
    void testCustomerTicketWorkflow() throws Exception {
        // Register customer
        RegisterRequest registerReq = new RegisterRequest("Charlie Customer", "charlie@test.com", "Password123!");
        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String customerToken = objectMapper.readTree(regResult.getResponse().getContentAsString()).get("token").asText();

        // Create ticket
        CreateTicketRequest ticketReq = new CreateTicketRequest(
                "Unable to reset account password",
                "I clicked the reset link but did not receive any recovery instructions in my email.",
                TicketCategory.ACCOUNT_ACCESS,
                TicketPriority.HIGH
        );

        mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ticketReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.ticketNumber").exists())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.customer.email").value("charlie@test.com"));

        // Query customer tickets
        mockMvc.perform(get("/api/tickets/my")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
