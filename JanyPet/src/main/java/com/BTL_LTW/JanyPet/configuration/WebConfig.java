package com.BTL_LTW.JanyPet.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@Configuration
public class WebConfig implements WebMvcConfigurer {
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

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
            
            // Check if directory exists and has read/write permissions
            File dir = uploadPath.toFile();
            if (!dir.exists()) {
                logger.error("Upload directory does not exist: {}", uploadPath);
            }
            if (!dir.canRead()) {
                logger.error("Upload directory is not readable: {}", uploadPath);
            }
            if (!dir.canWrite()) {
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
                // Use allowedOriginPatterns instead of allowedOrigins
                .allowedOriginPatterns( "http://127.0.0.1:5500")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }
}


    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            String location = "file:" + uploadPath.toString().replace("\\", "/") + "/";
            
            logger.info("Configuring resource handler for uploads. Path: {}", location);
            
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(location)
                    .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS)
                            .cachePublic())
                    .resourceChain(true);
                    
            // Log the actual directory to help with troubleshooting
            logger.info("Uploads will be served from: {} (points to {})", "/uploads/**", location);
                    
        } catch (Exception e) {
            logger.error("Error configuring resource handler", e);
            throw new RuntimeException("Error configuring resource handler", e);
        }

        // Static resources with proper caching
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/")
                .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS)
                        .cachePublic());

        // Add specific handler for favicon.ico
        registry.addResourceHandler("/favicon.ico")
                .addResourceLocations("classpath:/static/favicon.ico");
                
        registry.addResourceHandler("/chatbot-widget")
                .addResourceLocations("classpath:/static/chatbot-widget.html");
                
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
}
