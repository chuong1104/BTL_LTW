// src/main/java/com/BTL_LTW/JanyPet/config/VnPayConfig.java
package com.BTL_LTW.JanyPet.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VnPayConfig {


    @Value("${vnpay.payUrl}")
    private String vnpPayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnpReturnUrl;

    @Value("${vnpay.tmnCode}")
    private String vnpTmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnpHashSecret;

    public String getvnpPayUrl() {
        return vnpPayUrl;
    
    @Value("${vnpay.tmnCode}") // Default from prompt: CBV4016A
    private String tmnCode;
    
    @Value("${vnpay.hashSecret}")
    private String hashSecret;
    
    @Value("${vnpay.paymentUrl}")
    private String paymentUrl;
    
    @Value("${vnpay.returnUrl}")
    private String returnUrl;
    
    @Value("${vnpay.ipnUrl}")
    private String ipnUrl;
    
    // Getter methods
    public String getTmnCode() {
        return tmnCode;
    }

    public String getvnpReturnUrl() {
        return vnpReturnUrl;
    }

    public String getvnpTmnCode() {
        return vnpTmnCode;
    }

    public String getvnpHashSecret() {
        return vnpHashSecret;
    }
}
