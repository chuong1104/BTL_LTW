package com.BTL_LTW.JanyPet.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiResponse {
    private List<GeminiCandidate> candidates;
    private GeminiPromptFeedback promptFeedback;


    // Getters and Setters
    public List<GeminiCandidate> getCandidates() {
        return candidates;
    }

    public void setCandidates(List<GeminiCandidate> candidates) {
        this.candidates = candidates;
    }

    public GeminiPromptFeedback getPromptFeedback() {
        return promptFeedback;
    }

    public void setPromptFeedback(GeminiPromptFeedback promptFeedback) {
        this.promptFeedback = promptFeedback;
    }
}
