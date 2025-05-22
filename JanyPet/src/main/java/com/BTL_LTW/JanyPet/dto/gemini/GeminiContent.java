package com.BTL_LTW.JanyPet.dto.gemini;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeminiContent {
    private List<GeminiPart> parts;
    private String role; // "user" or "model"

    public GeminiContent() {}

    public GeminiContent(List<GeminiPart> parts) {
        this.parts = parts;
    }
    
    public GeminiContent(List<GeminiPart> parts, String role) {
        this.parts = parts;
        this.role = role;
    }

    // Getters and Setters
    public List<GeminiPart> getParts() {
        return parts;
    }

    public void setParts(List<GeminiPart> parts) {
        this.parts = parts;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
