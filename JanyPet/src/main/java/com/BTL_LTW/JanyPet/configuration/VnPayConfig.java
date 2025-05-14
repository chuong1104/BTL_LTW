package com.BTL_LTW.JanyPet.configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Component
@Configuration
public class VnPayConfig {
    
    @Value("${vnpay.tmnCode}") // Default from prompt: CBV4016A
    private String tmnCode;
    
    @Value("${vnpay.hashSecret}") // Default from prompt (second one): 3RJVZXLUE88KVIC143SMRKGCSXYNASBJ
    private String hashSecret;
    
    @Value("${vnpay.paymentUrl}") // Default from prompt: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
    private String paymentUrl;
    
    @Value("${vnpay.returnUrl}") // Will be loaded from application.yaml
    private String returnUrl;
    
    @Value("${vnpay.ipnUrl}") // Will be loaded from application.yaml
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
