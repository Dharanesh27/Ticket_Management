# SupportDesk REST API Documentation

Base URL: `/api`

All protected endpoints require the HTTP Authorization header:
`Authorization: Bearer <jwt_access_token>`

---

## 1. Authentication Endpoints

### 1.1 Register Customer
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Role:** Public
- **Request Body:**
  ```json
  {
    "name": "Sarah Customer",
    "email": "sarah@example.com",
    "password": "Password123!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "user": {
      "id": 2,
      "name": "Sarah Customer",
      "email": "sarah@example.com",
      "role": "ROLE_CUSTOMER",
      "active": true,
      "createdAt": "2026-10-12T11:32:05"
    }
  }
  ```

### 1.2 Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Role:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@supportdesk.com",
    "password": "Admin@SupportDesk2026!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "name": "System Administrator",
      "email": "admin@supportdesk.com",
      "role": "ROLE_ADMIN",
      "active": true
    }
  }
  ```

### 1.3 Get Current User Profile
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Role:** Authenticated
- **Response (200 OK):** User DTO

---

## 2. Customer Ticket Endpoints

### 2.1 Create Ticket
- **Method:** `POST`
- **Path:** `/api/tickets`
- **Role:** `ROLE_CUSTOMER`
- **Request Body:**
  ```json
  {
    "title": "VPN drops connection every 5 minutes",
    "description": "Whenever I connect to the office VPN, the connection drops immediately.",
    "category": "TECHNICAL_ISSUE",
    "priority": "HIGH"
  }
  ```
- **Response (201 Created):** Ticket DTO

### 2.2 List Customer's Own Tickets
- **Method:** `GET`
- **Path:** `/api/tickets/my?status=OPEN&page=0&size=10&sortBy=createdAt&direction=DESC`
- **Role:** `ROLE_CUSTOMER`
- **Response (200 OK):** Paginated `PageResponse<TicketDto>`

### 2.3 Get Customer Dashboard Statistics
- **Method:** `GET`
- **Path:** `/api/tickets/my/dashboard`
- **Role:** `ROLE_CUSTOMER`
- **Response (200 OK):** Ticket counts by status and top 5 recent tickets.

---

## 3. Shared Ticket Operations

### 3.1 Get Ticket Details by ID
- **Method:** `GET`
- **Path:** `/api/tickets/{id}`
- **Role:** Authenticated (Resource ownership validated for customers)
- **Response (200 OK):** Ticket DTO

### 3.2 Add Comment
- **Method:** `POST`
- **Path:** `/api/tickets/{id}/comments`
- **Role:** Authenticated (Customer on own ticket; Agent on assigned ticket; Admin on all)
- **Request Body:**
  ```json
  {
    "message": "We have investigated the router logs.",
    "internalNote": false
  }
  ```
- **Response (201 Created):** Comment DTO

### 3.3 List Comments
- **Method:** `GET`
- **Path:** `/api/tickets/{id}/comments`
- **Role:** Authenticated (Internal notes stripped for customers)
- **Response (200 OK):** `List<CommentDto>`

### 3.4 Get Ticket Audit History
- **Method:** `GET`
- **Path:** `/api/tickets/{id}/history`
- **Role:** Authenticated
- **Response (200 OK):** `List<TicketHistoryDto>`

---

## 4. Agent Operations

### 4.1 List Assigned Tickets
- **Method:** `GET`
- **Path:** `/api/agent/tickets?status=IN_PROGRESS&page=0&size=10`
- **Role:** `ROLE_AGENT` or `ROLE_ADMIN`
- **Response (200 OK):** Paginated `PageResponse<TicketDto>`

### 4.2 List Unassigned Open Tickets
- **Method:** `GET`
- **Path:** `/api/agent/tickets/unassigned?page=0&size=10`
- **Role:** `ROLE_AGENT` or `ROLE_ADMIN`
- **Response (200 OK):** Paginated `PageResponse<TicketDto>`

### 4.3 Claim Unassigned Ticket
- **Method:** `POST`
- **Path:** `/api/agent/tickets/{id}/claim`
- **Role:** `ROLE_AGENT` or `ROLE_ADMIN`
- **Response (200 OK):** Updated Ticket DTO with status `IN_PROGRESS`

### 4.4 Update Ticket Status
- **Method:** `PATCH`
- **Path:** `/api/agent/tickets/{id}/status`
- **Role:** `ROLE_AGENT` or `ROLE_ADMIN`
- **Request Body:**
  ```json
  {
    "status": "RESOLVED"
  }
  ```
- **Response (200 OK):** Updated Ticket DTO

### 4.5 Agent Dashboard Statistics
- **Method:** `GET`
- **Path:** `/api/agent/dashboard`
- **Role:** `ROLE_AGENT` or `ROLE_ADMIN`
- **Response (200 OK):** Agent workload counts and recent assigned tickets

---

## 5. Administrator Operations

### 5.1 List All Tickets
- **Method:** `GET`
- **Path:** `/api/admin/tickets?agentId=3&status=OPEN&page=0&size=10`
- **Role:** `ROLE_ADMIN`
- **Response (200 OK):** Paginated `PageResponse<TicketDto>`

### 5.2 Assign / Reassign Ticket
- **Method:** `PATCH`
- **Path:** `/api/admin/tickets/{id}/assign`
- **Role:** `ROLE_ADMIN`
- **Request Body:**
  ```json
  {
    "agentId": 3
  }
  ```
- **Response (200 OK):** Updated Ticket DTO

### 5.3 Admin Status Override
- **Method:** `PATCH`
- **Path:** `/api/admin/tickets/{id}/status`
- **Role:** `ROLE_ADMIN`
- **Request Body:**
  ```json
  {
    "status": "CLOSED"
  }
  ```
- **Response (200 OK):** Updated Ticket DTO

### 5.4 Executive Analytics Dashboard
- **Method:** `GET`
- **Path:** `/api/admin/dashboard`
- **Role:** `ROLE_ADMIN`
- **Response (200 OK):** Complete system status breakdown, priority counts, agent capacities, and activity feed

### 5.5 Manage Users & Staff
- `GET /api/admin/users`: List all registered accounts
- `GET /api/admin/users/agents`: List active support agents
- `POST /api/admin/users/agents`: Provision a new agent account
- `PATCH /api/admin/users/{id}/active`: Toggle account active / inactive status
