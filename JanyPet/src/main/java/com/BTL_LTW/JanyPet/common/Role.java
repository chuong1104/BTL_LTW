package com.BTL_LTW.JanyPet.common;

public enum Role {
    ADMIN("ADMIN"),
    EMPLOYEE("EMPLOYEE"), 
    CUSTOMER("CUSTOMER");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public String getAuthority() {
        return "ROLE_" + this.value;
    }
}
