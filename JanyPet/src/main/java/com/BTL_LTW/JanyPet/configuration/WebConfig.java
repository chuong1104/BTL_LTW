package com.BTL_LTW.JanyPet.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // Use allowedOriginPatterns instead of allowedOrigins
                .allowedOriginPatterns("http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }

//    @Override
//    public void addViewControllers(ViewControllerRegistry registry) {
//        // when user hits "/" or "/index", forward to static/index.html
//        registry.addViewController("/")
//                .setViewName("forward:/index.html");
//        registry.addViewController("/index")
//                .setViewName("forward:/index.html");
//
//        // when user hits "/admin", forward to static/admin.html
//        registry.addViewController("/admin")
//                .setViewName("forward:/admin.html");
//    }
}

