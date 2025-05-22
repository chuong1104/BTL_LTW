package com.BTL_LTW.JanyPet.dto;

public class ChatResponse {
    private String botResponse;

    public ChatResponse(String botResponse) {
        this.botResponse = botResponse;
    }

    // Getter
    public String getBotResponse() {
        return botResponse;
    }

    // Setter
    public void setBotResponse(String botResponse) {
        this.botResponse = botResponse;
    }
}
