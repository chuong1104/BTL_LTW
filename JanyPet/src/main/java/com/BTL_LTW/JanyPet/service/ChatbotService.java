package com.BTL_LTW.JanyPet.service;

import com.BTL_LTW.JanyPet.dto.gemini.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {
    
    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    
    @Value("${gemini.api.key}")
    private String geminiApiKey;
    
    private final RestTemplate restTemplate;
    private final Map<String, String> flowerPromptTemplates;
    
    @Autowired
    public ChatbotService(RestTemplate restTemplate, Map<String, String> flowerPromptTemplates) {
        this.restTemplate = restTemplate;
        this.flowerPromptTemplates = flowerPromptTemplates;
    }
    
    /**
     * Process a user query and get a response from Gemini AI
     */
    public String processQuery(String userMessage) {
        try {
            // Create a system prompt to set context for flower shop
            String systemPrompt = flowerPromptTemplates.get("system");
            
            // Create the content with system instruction and user message
            List<GeminiContent> contents = new ArrayList<>();
            
            // Add system message
            List<GeminiPart> systemParts = new ArrayList<>();
            systemParts.add(new GeminiPart(systemPrompt));
            contents.add(new GeminiContent(systemParts, "system"));
            
            // Add user message
            List<GeminiPart> userParts = new ArrayList<>();
            userParts.add(new GeminiPart(userMessage));
            contents.add(new GeminiContent(userParts, "user"));
            
            // Create the request
            GeminiRequest request = new GeminiRequest(contents);
            
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", geminiApiKey);
            
            // Create the HTTP entity
            HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);
            
            // Make the API call
            GeminiResponse response = restTemplate.postForObject(
                geminiApiUrl,
                entity,
                GeminiResponse.class
            );
            
            // Process the response
            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                GeminiCandidate candidate = response.getCandidates().get(0);
                if (candidate.getContent() != null && 
                    candidate.getContent().getParts() != null && 
                    !candidate.getContent().getParts().isEmpty()) {
                    return candidate.getContent().getParts().get(0).getText();
                }
            }
            
            return "Xin lỗi, tôi không thể trả lời câu hỏi của bạn lúc này. Vui lòng thử lại sau.";
            
        } catch (Exception e) {
            return "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
        }
    }
    
    /**
     * Process product-specific queries with specialized knowledge
     * @param userMessage The user's question about products
     * @return AI response with product information
     */
    public String processProductQuery(String userMessage) {
        try {
            // Create a specific product-focused system prompt
            String systemPrompt = flowerPromptTemplates.get("product") != null ? 
                flowerPromptTemplates.get("product") : 
                "You are a helpful pet shop assistant who knows all about our products. " +
                "Provide detailed information about pet products, their uses, benefits, and recommendations. " +
                "If asked about product availability or specific pricing, politely suggest the customer check our current inventory.";
            
            // Create the content with system instruction and user message
            List<GeminiContent> contents = new ArrayList<>();
            
            // Add system message
            List<GeminiPart> systemParts = new ArrayList<>();
            systemParts.add(new GeminiPart(systemPrompt));
            contents.add(new GeminiContent(systemParts, "system"));
            
            // Add user message
            List<GeminiPart> userParts = new ArrayList<>();
            userParts.add(new GeminiPart(userMessage));
            contents.add(new GeminiContent(userParts, "user"));
            
            // Create the request
            GeminiRequest request = new GeminiRequest(contents);
            
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", geminiApiKey);
            
            // Create the HTTP entity
            HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);
            
            // Make the API call
            GeminiResponse response = restTemplate.postForObject(
                geminiApiUrl,
                entity,
                GeminiResponse.class
            );
            
            // Process the response
            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                GeminiCandidate candidate = response.getCandidates().get(0);
                if (candidate.getContent() != null && 
                    candidate.getContent().getParts() != null && 
                    !candidate.getContent().getParts().isEmpty()) {
                    return candidate.getContent().getParts().get(0).getText();
                }
            }
            
            return "Xin lỗi, tôi không thể trả lời câu hỏi về sản phẩm của bạn lúc này. Vui lòng thử lại sau.";
            
        } catch (Exception e) {
            return "Đã xảy ra lỗi khi xử lý yêu cầu sản phẩm của bạn. Vui lòng thử lại sau.";
        }
    }
}
