package com.BTL_LTW.JanyPet.service;

import com.BTL_LTW.JanyPet.dto.gemini.*;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.entity.Service; 
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.repository.ServiceRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList; // Added
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher; // Added
import java.util.regex.Pattern; // Added
import java.util.stream.Collectors; // Added

@org.springframework.stereotype.Service
public class GeminiApiService {

    private static final Logger LOGGER = Logger.getLogger(GeminiApiService.class.getName());

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ProductRepository productRepository; // Added
    private final ServiceRepository serviceRepository; // Added

    // Updated SYSTEM_PROMPT to be a template for flower shop
    private static final String SYSTEM_PROMPT_TEMPLATE =
            "Bạn là một trợ lý ảo của JanyFlower, một cửa hàng chuyên về hoa tươi và dịch vụ thiết kế hoa. " +
            "Nhiệm vụ của bạn là trả lời các câu hỏi của khách hàng một cách thân thiện và hữu ích. " +
            "Hãy ưu tiên sử dụng thông tin từ cơ sở dữ liệu được cung cấp dưới đây để trả lời. " +
            "Nếu thông tin không đủ hoặc không có, hãy trả lời dựa trên kiến thức chung về JanyFlower. " +
            "Luôn giữ thái độ chuyên nghiệp và tập trung vào các loại hoa, sản phẩm và dịch vụ hoa của JanyFlower. " +
            "Nếu câu hỏi không liên quan, hãy lịch sự từ chối và gợi ý hỏi về JanyFlower.\n" +
            "Dưới đây là một số thông tin từ cơ sở dữ liệu của chúng tôi có thể liên quan đến câu hỏi của người dùng:\n%s";

    // Constructor updated
    public GeminiApiService(RestTemplate restTemplate, ObjectMapper objectMapper,
                            ProductRepository productRepository, ServiceRepository serviceRepository) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.productRepository = productRepository;
        this.serviceRepository = serviceRepository;
    }

    // Helper method to extract a simple keyword (updated for flower shop)
    private String extractSearchKeyword(String userMessage, String[] triggerWords) {
        String lowerUserMessage = userMessage.toLowerCase();
        for (String trigger : triggerWords) {
            String lowerTrigger = trigger.toLowerCase();
            if (lowerUserMessage.contains(lowerTrigger)) {
                // Attempt to get text after the trigger word
                int triggerEndIndex = lowerUserMessage.indexOf(lowerTrigger) + lowerTrigger.length();
                String potentialKeyword = userMessage.substring(triggerEndIndex).trim();
                // Remove common question phrases or refine further
                potentialKeyword = potentialKeyword.replaceAll("^(là gì|có không|giá bao nhiêu|về)\\s*", "").trim();
                if (!potentialKeyword.isEmpty() && potentialKeyword.split("\\s+").length <= 5) { // Limit keyword length
                    return potentialKeyword;
                }
            }
        }
        // Fallback: try to find nouns not in common words (very basic)
        List<String> commonWords = Arrays.asList("bạn", "tôi", "là", "có", "không", "của", "và", "cho", "với", "tại", "ở", "muốn", "hỏi", "về", "giá", "bao nhiêu", "shop", "cửa hàng");
        return Arrays.stream(lowerUserMessage.split("\\s+"))
                .filter(word -> word.length() > 2 && !commonWords.contains(word) && !Arrays.asList(triggerWords).contains(word))
                .findFirst()
                .orElse(null);
    }

    // New method to get context from database (updated for flower shop)
    private String getDatabaseContext(String userMessage) {
        StringBuilder contextBuilder = new StringBuilder();
        String userMessageLower = userMessage.toLowerCase();

        String[] productTriggers = {"hoa", "flower", "bó hoa", "lẵng hoa", "hộp hoa", "giỏ hoa", "cây cảnh", "hồng", "tulip", "lily", "cẩm tú cầu", "hướng dương"};
        String[] serviceTriggers = {"dịch vụ", "service", "thiết kế", "trang trí", "cắm hoa", "giao hoa", "hoa sự kiện", "hoa cưới", "hoa sinh nhật", "hoa chia buồn"};

        boolean askedAboutProduct = Arrays.stream(productTriggers).anyMatch(userMessageLower::contains);
        boolean askedAboutService = Arrays.stream(serviceTriggers).anyMatch(userMessageLower::contains);

        String productKeyword = null;
        if (askedAboutProduct) {
            productKeyword = extractSearchKeyword(userMessage, productTriggers);
        }

        String serviceKeyword = null;
        if (askedAboutService) {
            serviceKeyword = extractSearchKeyword(userMessage, serviceTriggers);
        }

        if (productKeyword != null) {
            List<Product> products = productRepository.searchProductsByKeyword(productKeyword);
            if (!products.isEmpty()) {
                contextBuilder.append("Thông tin sản phẩm hoa liên quan đến '").append(productKeyword).append("':\n");
                products.stream().limit(3).forEach(p -> // Limit to 3 products
                        contextBuilder.append(String.format("- Tên: %s. Giá: %s VND. Mô tả ngắn: %s\n",
                                p.getName(),
                                p.getPrice().toBigInteger(), // Format price
                                p.getDescription() != null ? p.getDescription().substring(0, Math.min(p.getDescription().length(), 70)) + "..." : "Không có mô tả"))
                );
            }
        } else if (askedAboutProduct) { // General product query
            List<Product> products = productRepository.findTop5ByIsActiveTrueOrderByCreatedAtDesc();
            if (!products.isEmpty()) {
                contextBuilder.append("Một số sản phẩm hoa nổi bật tại JanyFlower:\n");
                products.stream().limit(2).forEach(p ->
                        contextBuilder.append(String.format("- %s: %s VND\n", p.getName(), p.getPrice().toBigInteger()))
                );
            }
        }

        if (serviceKeyword != null) {
            List<Service> services = serviceRepository.searchServicesByKeyword(serviceKeyword);
            if (!services.isEmpty()) {
                contextBuilder.append("Thông tin dịch vụ hoa liên quan đến '").append(serviceKeyword).append("':\n");
                services.stream().limit(3).forEach(s ->
                        contextBuilder.append(String.format("- Tên: %s. Mô tả: %s\n",
                                s.getName(),
                                s.getDescription() != null ? s.getDescription().substring(0, Math.min(s.getDescription().length(), 70)) + "..." : "Chưa có mô tả chi tiết"))
                );
            }
        } else if (askedAboutService) { // General service query
            List<Service> services = serviceRepository.findTop5ByOrderByCreatedAtDesc();
            if (!services.isEmpty()) {
                contextBuilder.append("Một số dịch vụ hoa nổi bật tại JanyFlower:\n");
                services.stream().limit(2).forEach(s ->
                        contextBuilder.append(String.format("- %s\n", s.getName()))
                );
            }
        }

        if (contextBuilder.length() == 0) {
            return "Không có thông tin cụ thể nào từ cơ sở dữ liệu cho truy vấn này. Hãy trả lời dựa trên kiến thức chung về JanyFlower - cửa hàng hoa tươi và dịch vụ cắm hoa.";
        }
        return contextBuilder.toString();
    }

    public String getGeminiResponse(String userMessage) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            LOGGER.log(Level.SEVERE, "GEMINI_API_KEY is not configured.");
            return "Lỗi: API Key chưa được cấu hình.";
        }

        String dbContext = getDatabaseContext(userMessage);
        String finalSystemPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, dbContext);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String fullApiUrl = this.apiUrl + "?key=" + this.apiKey;

        // Constructing the request body
        // The Gemini API prefers instructions and context as part of the conversational turns.
        // We'll put the system prompt (with DB context) and user message in the first 'user' turn.
        List<GeminiPart> parts = new ArrayList<>();
        parts.add(new GeminiPart(finalSystemPrompt + "\n\nCâu hỏi của khách hàng: " + userMessage));
        
        List<GeminiContent> contents = new ArrayList<>();
        contents.add(new GeminiContent(parts, "user"));

        GeminiRequest geminiRequest = new GeminiRequest(contents);
        HttpEntity<GeminiRequest> entity = new HttpEntity<>(geminiRequest, headers);

        try {
            // Temporarily log request for debugging
            // LOGGER.info("Gemini Request Body: " + objectMapper.writeValueAsString(geminiRequest));

            ResponseEntity<String> rawResponseEntity = restTemplate.postForEntity(fullApiUrl, entity, String.class);
            String rawResponseBody = rawResponseEntity.getBody();
            LOGGER.info("Raw Gemini API Response: " + rawResponseBody);

            if (rawResponseEntity.getStatusCode() == HttpStatus.OK && rawResponseBody != null) {
                GeminiResponse geminiResponse = objectMapper.readValue(rawResponseBody, GeminiResponse.class);
                return extractAndFormatResponse(geminiResponse);
            } else {
                LOGGER.log(Level.WARNING, "Error response from Gemini API: " + rawResponseEntity.getStatusCode() + " - " + rawResponseBody);
                return "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này (mã lỗi: " + rawResponseEntity.getStatusCode() + ").";
            }
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HttpClientErrorException when calling Gemini API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
            return "Đã xảy ra lỗi khi giao tiếp với dịch vụ AI ("+ e.getClass().getSimpleName() +"): " + e.getStatusCode() + ". Chi tiết: " + e.getResponseBodyAsString();
        } catch (JsonProcessingException e) {
            LOGGER.log(Level.SEVERE, "JsonProcessingException when processing Gemini API request/response: " + e.getMessage(), e);
            return "Lỗi xử lý dữ liệu JSON khi giao tiếp với dịch vụ AI.";
        }
        catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected exception when calling Gemini API: " + e.getMessage(), e);
            try {
                LOGGER.severe("Failed API Call URL: " + fullApiUrl);
                LOGGER.severe("Failed API Call Request (JSON): " + objectMapper.writeValueAsString(geminiRequest));
            } catch (JsonProcessingException jsonEx) {
                LOGGER.severe("Could not serialize request for logging during exception.");
            }
            return "Đã xảy ra lỗi không mong muốn khi xử lý yêu cầu của bạn.";
        }
    }

    private String extractAndFormatResponse(GeminiResponse geminiResponse) {
        if (geminiResponse == null || geminiResponse.getCandidates() == null || geminiResponse.getCandidates().isEmpty()) {
            LOGGER.warning("Gemini response or candidates are null/empty.");
            return "Xin lỗi, tôi không nhận được phản hồi hợp lệ từ AI.";
        }

        try {
            GeminiCandidate firstCandidate = geminiResponse.getCandidates().get(0);
            if (firstCandidate.getContent() == null || firstCandidate.getContent().getParts() == null || firstCandidate.getContent().getParts().isEmpty()) {
                LOGGER.warning("Gemini candidate content or parts are null/empty.");
                return "Xin lỗi, nội dung phản hồi từ AI không đầy đủ.";
            }

            String rawText = firstCandidate.getContent().getParts().get(0).getText();
            return formatResponseAsHtml(rawText);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Error processing Gemini response: " + e.getMessage(), e);
            return "Đã có lỗi xảy ra khi xử lý phản hồi. Vui lòng thử lại sau.";
        }
    }

    private String formatResponseAsHtml(String text) {
        if (text == null) return "";
        
        // Sanitize input to prevent HTML/script injection
        text = text.replace("<", "&lt;").replace(">", "&gt;");
        
        // Handle code blocks first (```code```
        StringBuilder result = new StringBuilder();
        Pattern codeBlockPattern = Pattern.compile("```([\\s\\S]*?)```");
        Matcher codeBlockMatcher = codeBlockPattern.matcher(text);
        
        int lastEnd = 0;
        while (codeBlockMatcher.find()) {
            // Add text before code block
            result.append(formatInlineMarkdown(text.substring(lastEnd, codeBlockMatcher.start())));
            
            // Format code block
            String codeContent = codeBlockMatcher.group(1).trim();
            result.append("<div class=\"code-block\"><pre><code>")
                  .append(codeContent)
                  .append("</code></pre></div>");
            
            lastEnd = codeBlockMatcher.end();
        }
        
        // Add remaining text
        if (lastEnd < text.length()) {
            result.append(formatInlineMarkdown(text.substring(lastEnd)));
        }
        
        return result.toString();
    }
    
    private String formatInlineMarkdown(String text) {
        // Convert newlines to HTML line breaks
        String formatted = text.replace("\n\n", "<br><br>").replace("\n", "<br>");
        
        // Format headers
        formatted = formatted.replaceAll("(?m)^# (.*?)$", "<h2>$1</h2>");
        formatted = formatted.replaceAll("(?m)^## (.*?)$", "<h3>$1</h3>");
        formatted = formatted.replaceAll("(?m)^### (.*?)$", "<h4>$1</h4>");
        
        // Format lists
        formatted = formatted.replaceAll("(?m)^- (.*?)$", "<li>$1</li>");
        formatted = formatted.replaceAll("(?m)^\\d+\\. (.*?)$", "<li>$1</li>");
        formatted = formatted.replaceAll("(<li>.*?</li>)+", "<ul>$0</ul>");
        
        // Format bold and italic text
        formatted = formatted.replaceAll("\\*\\*(.*?)\\*\\*", "<strong>$1</strong>");
        formatted = formatted.replaceAll("\\*(.*?)\\*", "<em>$1</em>");
        
        return formatted;
    }
}
