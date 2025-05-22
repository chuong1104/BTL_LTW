package com.BTL_LTW.JanyPet.configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Component
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
    
    public String getHashSecret() {
        return hashSecret;
    }
    
    public String getPaymentUrl() {
        return paymentUrl;
    }
    
    public String getReturnUrl() {
        return returnUrl;
    }
    
    public String getIpnUrl() {
        return ipnUrl;
    }
}
