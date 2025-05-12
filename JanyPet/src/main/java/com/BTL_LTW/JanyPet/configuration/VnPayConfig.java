

package com.BTL_LTW.JanyPet.configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Component
@Configuration
public class VnPayConfig {
    
    @Value("${vnpay.tmnCode:CBV4016A}")
    private String tmnCode;
    
    @Value("${vnpay.hashSecret:3RJVZXLUE88KVIC143SMRKGCSXYNASBJ}")
    private String hashSecret;
    
    @Value("${vnpay.paymentUrl:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String paymentUrl;
    
    @Value("${vnpay.returnUrl:http://localhost:8080/vnpay/payment-callback}")
    private String returnUrl;
    
    // Thêm IPN URL
    @Value("${vnpay.ipnUrl:http://localhost:8080/vnpay/ipn-callback}")
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
