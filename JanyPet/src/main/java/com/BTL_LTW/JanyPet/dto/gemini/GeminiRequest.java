package com.BTL_LTW.JanyPet.dto.gemini;

import java.util.List;

public class GeminiRequest {
    private List<GeminiContent> contents;
    // Add generationConfig if needed, e.g., for temperature, maxOutputTokens

    public GeminiRequest(List<GeminiContent> contents) {
        this.contents = contents;
    }

    // Getter
    public List<GeminiContent> getContents() {
        return contents;
    }

    // Setter
    public void setContents(List<GeminiContent> contents) {
        this.contents = contents;
    }
}
