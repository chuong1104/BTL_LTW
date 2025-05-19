package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.ChatRequest;
import com.BTL_LTW.JanyPet.dto.ChatResponse;
import com.BTL_LTW.JanyPet.service.GeminiApiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/chatbot")
public class ChatController {

    private static final Logger LOGGER = Logger.getLogger(ChatController.class.getName());
    private final GeminiApiService geminiApiService;

    public ChatController(GeminiApiService geminiApiService) {
        this.geminiApiService = geminiApiService;
    }

    @PostMapping("/query")
    public ResponseEntity<ChatResponse> handleChatQuery(@RequestBody ChatRequest chatRequest) {
        if (chatRequest == null || chatRequest.getMessage() == null || chatRequest.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Tin nhắn không được để trống."));
        }

        try {
            String userMessage = chatRequest.getMessage();
            LOGGER.log(Level.INFO, "Received user message: " + userMessage);
            String botResponse = geminiApiService.getGeminiResponse(userMessage);
            LOGGER.log(Level.INFO, "Sending bot response: " + botResponse);
            return ResponseEntity.ok(new ChatResponse(botResponse));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error processing chat query: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(new ChatResponse("Đã có lỗi xảy ra phía máy chủ. Vui lòng thử lại sau."));
        }
    }
}
