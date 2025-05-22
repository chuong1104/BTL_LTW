package com.BTL_LTW.JanyPet.dto.response;

import java.util.List;

public class JwtResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private Long tokenExpiry;
    private String id;
    private String username;
    private String email;
    private String phoneNumber;
    private List<String> roles;

    public JwtResponse(String token, String refreshToken, Long tokenExpiry,
                      String id, String username, String email, 
                      String phoneNumber, List<String> roles) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.tokenExpiry = tokenExpiry;
        this.id = id;
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getTokenExpiry() {
        return tokenExpiry;
    }

    public void setTokenExpiry(Long tokenExpiry) {
        this.tokenExpiry = tokenExpiry;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
