package com.BTL_LTW.JanyPet.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/powerbi")
public class PowerBIController {

    @GetMapping("/embedinfo")
    public ResponseEntity<Map<String, String>> getEmbedInfo() {
        // In production, you should use Azure AD authentication to get these values
        Map<String, String> embedInfo = new HashMap<>();
        embedInfo.put("embedUrl", "https://app.powerbi.com/reportEmbed?reportId=7ae39686-d684-47d4-bd9f-c9d3712420fc&autoAuth=true&ctid=1fdc19b7-04f2-4d7a-93ec-035c423b3cec&actionBarEnabled=true");
        embedInfo.put("reportId", "7ae39686-d684-47d4-bd9f-c9d3712420fc");
        embedInfo.put("token", "YOUR_EMBED_TOKEN");
        
        return ResponseEntity.ok(embedInfo);
    }
}