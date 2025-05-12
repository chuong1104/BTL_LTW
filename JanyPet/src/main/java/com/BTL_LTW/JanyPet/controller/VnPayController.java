package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.configuration.VnPayConfig;
import com.BTL_LTW.JanyPet.service.Interface.OrderService;
import com.BTL_LTW.JanyPet.utils.VnPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/vnpay")
public class VnPayController {

    private static final Logger logger = Logger.getLogger(VnPayController.class.getName());

    @Autowired
    private VnPayConfig vnPayConfig;

    @Autowired
    private OrderService orderService;

    @PostMapping("/create_payment")
    public ResponseEntity<?> createPayment(HttpServletRequest request, @RequestBody PaymentRequestDTO paymentRequestDTO) {
        try {
            if (paymentRequestDTO.getOrderCode() == null || paymentRequestDTO.getOrderCode().isEmpty()) {
                return ResponseEntity.badRequest().body(new PaymentResponseDTO("ERROR", "Missing orderCode", null, null));
            }
            if (paymentRequestDTO.getAmount() <= 0) {
                return ResponseEntity.badRequest().body(new PaymentResponseDTO("ERROR", "Invalid amount", null, paymentRequestDTO.getOrderCode()));
            }

            String vnp_TxnRef = paymentRequestDTO.getOrderCode(); // This should be your unique order ID
            long amount = paymentRequestDTO.getAmount() * 100L; // Amount in VND * 100

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");

            String bankCode = paymentRequestDTO.getBankCode();
            if (bankCode != null && !bankCode.isEmpty()) {
                vnp_Params.put("vnp_BankCode", bankCode);
            }

            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            String orderInfo = paymentRequestDTO.getOrderInfo() != null ? paymentRequestDTO.getOrderInfo() : "Thanh toan don hang " + vnp_TxnRef;
            vnp_Params.put("vnp_OrderInfo", orderInfo);
            vnp_Params.put("vnp_OrderType", "other"); // Default type

            String locate = paymentRequestDTO.getLanguage();
            if (locate == null || locate.isEmpty()) {
                locate = "vn";
            }
            vnp_Params.put("vnp_Locale", locate);
            vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnp_Params.put("vnp_IpAddr", VnPayUtil.getIpAddress(request));

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15); // Payment expiry time
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Build query URL for hashing
            String queryUrlForHash = VnPayUtil.getPaymentUrl(vnp_Params, true);
            String vnp_SecureHash = VnPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), queryUrlForHash);
            
            // Build query URL for redirection (without hash in params)
            String queryUrlForRedirect = VnPayUtil.getPaymentUrl(vnp_Params, false);
            String paymentUrl = vnPayConfig.getPaymentUrl() + "?" + queryUrlForRedirect + "&vnp_SecureHash=" + vnp_SecureHash;
            
            logger.info("Generated VNPAY URL for order " + vnp_TxnRef + ": " + paymentUrl);
            return ResponseEntity.ok(new PaymentResponseDTO("OK", "Successfully created VNPAY payment URL", paymentUrl, vnp_TxnRef));

        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error creating VNPAY payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new PaymentResponseDTO("ERROR", "Internal server error", null, paymentRequestDTO.getOrderCode()));
        }
    }

    @GetMapping("/ipn")
    public ResponseEntity<String> ipnReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = fields.remove("vnp_SecureHash"); // Remove hash before building data for verification

        if (vnp_SecureHash == null) {
            logger.warning("IPN call missing vnp_SecureHash for order: " + fields.getOrDefault("vnp_TxnRef", "UNKNOWN"));
            return ResponseEntity.ok("{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}");
        }
        
        // Build data string for hash verification from remaining fields
        String dataForHashVerification = VnPayUtil.getPaymentUrl(fields, true);
        String calculatedHash = VnPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), dataForHashVerification);

        if (!calculatedHash.equals(vnp_SecureHash)) {
            logger.warning("IPN Checksum failed for order: " + fields.get("vnp_TxnRef") + ". Received hash: " + vnp_SecureHash + ", Calculated hash: " + calculatedHash);
            return ResponseEntity.ok("{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}");
        }

        String orderCode = fields.get("vnp_TxnRef");
        String vnpResponseCode = fields.get("vnp_ResponseCode");
        String vnpTransactionNo = fields.get("vnp_TransactionNo");
        String vnpBankCode = fields.get("vnp_BankCode");
        String vnpCardType = fields.get("vnp_CardType");
        String amountStr = fields.get("vnp_Amount"); // Amount in VNPAY format (VND * 100)

        if (orderCode == null || vnpResponseCode == null || amountStr == null) {
             logger.warning("IPN missing required parameters for order: " + orderCode);
            return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"Missing required parameters\"}");
        }

        try {
            BigDecimal paidAmountVND = new BigDecimal(amountStr).divide(new BigDecimal(100)); // Convert to VND

            boolean updateSuccess = orderService.updateOrderStatusAfterVnPay(orderCode, vnpResponseCode, vnpTransactionNo, vnpBankCode, vnpCardType, paidAmountVND);

            if (updateSuccess) {
                logger.info("IPN processed successfully for order: " + orderCode + ", VNPAY Response: " + vnpResponseCode);
                if ("00".equals(vnpResponseCode)) {
                     return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
                } else {
                    return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
                }
            } else {
                logger.warning("IPN processing failed by OrderService for order: " + orderCode);
                return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"Unknown error on merchant server\"}");
            }
        } catch (NumberFormatException e) {
            logger.log(Level.SEVERE, "IPN amount parsing error for order: " + orderCode, e);
            return ResponseEntity.ok("{\"RspCode\":\"04\",\"Message\":\"Invalid Amount\"}");
        } catch (Exception e) {
            logger.log(Level.SEVERE, "IPN processing error for order: " + orderCode, e);
            return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"Unknown error on merchant server\"}");
        }
    }

    @GetMapping("/payment_return")
    public RedirectView paymentReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = fields.get("vnp_SecureHash");

        String orderId = fields.getOrDefault("vnp_TxnRef", "");
        String responseCode = fields.getOrDefault("vnp_ResponseCode", "99");
        String amount = fields.getOrDefault("vnp_Amount", "0");
        String messageCode;

        String redirectUrl = "/payment-result.html?";

        if ("00".equals(responseCode)) {
            messageCode = "SUCCESS";
            redirectUrl += "status=success";
        } else if ("24".equals(responseCode)) {
            messageCode = "USER_CANCELLED";
            redirectUrl += "status=cancelled";
        } else {
            messageCode = "FAILED";
            redirectUrl += "status=failed";
        }

        redirectUrl += "&orderId=" + URLEncoder.encode(orderId, StandardCharsets.UTF_8);
        redirectUrl += "&amount=" + URLEncoder.encode(amount, StandardCharsets.UTF_8);
        redirectUrl += "&rspCode=" + URLEncoder.encode(responseCode, StandardCharsets.UTF_8);
        redirectUrl += "&message=" + URLEncoder.encode(messageCode, StandardCharsets.UTF_8);
        
        logger.info("Redirecting to: " + redirectUrl + " for order " + orderId);
        return new RedirectView(redirectUrl);
    }

    static class PaymentRequestDTO {
        private long amount;
        private String bankCode;
        private String language;
        private String orderInfo;
        private String orderCode;

        public long getAmount() { return amount; }
        public void setAmount(long amount) { this.amount = amount; }
        public String getBankCode() { return bankCode; }
        public void setBankCode(String bankCode) { this.bankCode = bankCode; }
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public String getOrderInfo() { return orderInfo; }
        public void setOrderInfo(String orderInfo) { this.orderInfo = orderInfo; }
        public String getOrderCode() { return orderCode; }
        public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
    }

    static class PaymentResponseDTO {
        private String status;
        private String message;
        private String paymentUrl;
        private String orderCode;

        public PaymentResponseDTO(String status, String message, String paymentUrl, String orderCode) {
            this.status = status;
            this.message = message;
            this.paymentUrl = paymentUrl;
            this.orderCode = orderCode;
        }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getPaymentUrl() { return paymentUrl; }
        public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
        public String getOrderCode() { return orderCode; }
        public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
    }
}