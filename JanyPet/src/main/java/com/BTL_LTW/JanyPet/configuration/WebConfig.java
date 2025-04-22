package com.BTL_LTW.JanyPet.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);
    
    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            
            // Kiểm tra quyền đọc/ghi
            if (!Files.isReadable(uploadPath)) {
                logger.error("Upload directory is not readable: {}", uploadPath);
            }
            if (!Files.isWritable(uploadPath)) {
                logger.error("Upload directory is not writable: {}", uploadPath);
            }
            
            logger.info("Upload directory initialized at: {}", uploadPath);
        } catch (IOException e) {
            logger.error("Could not create upload directory!", e);
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8080", "http://127.0.0.1:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            String location = "file:" + uploadPath.toString().replace("\\", "/") + "/";
            
            logger.info("Configuring resource handler for uploads. Path: {}", location);
            
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(location)
                    .setCachePeriod(3600)
                    .resourceChain(true);
                    
        } catch (Exception e) {
            logger.error("Error configuring resource handler", e);
            throw new RuntimeException("Error configuring resource handler", e);
        }
    }
}

