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

    // Builds the query string for VNPAY.
    // isForHash = true: builds string for hashing (key=value&key=value)
    // isForHash = false: builds query string for URL (key=encodedValue&key=encodedValue)
    public static String getPaymentUrl(Map<String, String> paramsMap, boolean isForHash) {
        List<String> fieldNames = new ArrayList<>(paramsMap.keySet());
        Collections.sort(fieldNames);
        StringBuilder stringBuilder = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = paramsMap.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                if (stringBuilder.length() > 0) {
                    stringBuilder.append("&");
                }
                stringBuilder.append(fieldName);
                stringBuilder.append("=");
                if (isForHash) {
                    stringBuilder.append(fieldValue);
                } else {
                    try {
                        stringBuilder.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    } catch (UnsupportedEncodingException e) {
                        logger.log(Level.SEVERE, "Error encoding URL parameter: " + fieldValue, e);
                        // Or rethrow as a runtime exception
                    }
                }
            }
        }
        return stringBuilder.toString();
    }
}
