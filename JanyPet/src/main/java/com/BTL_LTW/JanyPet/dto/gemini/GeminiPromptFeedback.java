package com.BTL_LTW.JanyPet.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiPromptFeedback {
    private List<GeminiSafetyRating> safetyRatings;
    // Potentially other fields like blockReason

    // Getters and Setters
    public List<GeminiSafetyRating> getSafetyRatings() {
        return safetyRatings;
    }

    public void setSafetyRatings(List<GeminiSafetyRating> safetyRatings) {
        this.safetyRatings = safetyRatings;
    }
}
