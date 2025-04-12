package com.BTL_LTW.JanyPet.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // áp dụng cho tất cả endpoint
                .allowedOrigins("http://localhost:3000", "http://localhost:5500") // thêm domain front-end nếu cần
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*") // cho phép tất cả header (Authorization, Content-Type,...)
                .allowCredentials(true) // cho phép gửi cookie/token qua cross-origin
                .maxAge(3600); // cache pre-flight request trong 1h
    }
}
