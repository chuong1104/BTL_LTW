package com.BTL_LTW.JanyPet.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiCandidate {
    private GeminiContent content;
    private String finishReason;
    private List<GeminiSafetyRating> safetyRatings;

    // Getters and Setters
    public GeminiContent getContent() {
        return content;
    }

    public void setContent(GeminiContent content) {
        this.content = content;
    }

    public String getFinishReason() {
        return finishReason;
    }

    public void setFinishReason(String finishReason) {
        this.finishReason = finishReason;
    }

    public List<GeminiSafetyRating> getSafetyRatings() {
        return safetyRatings;
    }

    public void setSafetyRatings(List<GeminiSafetyRating> safetyRatings) {
        this.safetyRatings = safetyRatings;
    }
}
