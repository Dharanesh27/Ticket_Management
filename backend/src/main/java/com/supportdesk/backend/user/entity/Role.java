package com.supportdesk.backend.user.entity;

public enum Role {
    ROLE_ADMIN,
    ROLE_AGENT,
    ROLE_CUSTOMER;

    public String getCleanName() {
        return this.name().replace("ROLE_", "");
    }
}
