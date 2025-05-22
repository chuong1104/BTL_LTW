package com.BTL_LTW.JanyPet.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import jakarta.servlet.http.HttpServletRequest;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

public class VnPayUtil {
    private static final Logger logger = Logger.getLogger(VnPayUtil.class.getName());

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException("Key or data for HMACSHA512 cannot be null");
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to generate HMACSHA512", e);
            throw new RuntimeException("Failed to generate HMACSHA512", e);
        }
    }
    public static String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        // Handle multiple IPs in X-FORWARDED-FOR
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        return ipAddress;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    // Builds the query string for VNPAY, adapted from the servlet example.
    // isForHash = true: builds string for hashing (fieldName=URLEncode(fieldValue, "US-ASCII"))
    // isForHash = false: builds query string for URL (URLEncode(fieldName, "US-ASCII")=URLEncode(fieldValue, "US-ASCII"))
    public static String getPaymentUrl(Map<String, String> vnp_Params, boolean isForHash) {
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames); // Sorting alphabetically is critical!
        
        StringBuilder sb = new StringBuilder();
        
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                try {
                    if (isForHash) {
                        // For hashData: fieldName=URLEncode(fieldValue, "US-ASCII")
                        sb.append(fieldName);
                        sb.append('=');
                        sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    } else {
                        // For query string: URLEncode(fieldName, "US-ASCII")=URLEncode(fieldValue, "US-ASCII")
                        sb.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                        sb.append('=');
                        sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    }
                    
                    if (itr.hasNext()) {
                        sb.append('&');
                    }
                } catch (UnsupportedEncodingException e) {
                    // US_ASCII should always be supported.
                    // This is a critical error if it happens, as it will likely lead to signature mismatch.
                    logger.log(Level.SEVERE, "US_ASCII encoding not supported! This will cause issues.", e);
                    // As a fallback, append raw values, but this is not per servlet example and will likely fail.
                    // Consider throwing a runtime exception or handling more gracefully if this is a possibility.
                    if (isForHash) {
                        sb.append(fieldName).append('=').append(fieldValue);
                    } else {
                        sb.append(fieldName).append('=').append(fieldValue);
                    }
                    if (itr.hasNext()) {
                        sb.append('&');
                    }
                }
            }
        }
        return sb.toString();
    }
}
