package com.BTL_LTW.JanyPet.dto.response;

public class TokenRefreshResponse {
    private String token;
    private String type = "Bearer";
    private Long tokenExpiry;

    public TokenRefreshResponse(String token, Long tokenExpiry) {
        this.token = token;
        this.tokenExpiry = tokenExpiry;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getTokenExpiry() {
        return tokenExpiry;
    }

    public void setTokenExpiry(Long tokenExpiry) {
        this.tokenExpiry = tokenExpiry;
    }
}