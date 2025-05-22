package com.BTL_LTW.JanyPet.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();

        try {
            // Kiểm tra xem file có rỗng không
            if (file.isEmpty()) {
                response.put("error", "File rỗng");
                return ResponseEntity.badRequest().body(response);
            }

            // Tạo thư mục nếu chưa tồn tại
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Tạo tên file duy nhất
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
            
            // Lưu file
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);
            Files.copy(file.getInputStream(), filePath);

            // Trả về url của file
            String fileUrl = "/uploads/" + uniqueFileName;
            response.put("url", fileUrl);
            response.put("filename", uniqueFileName);
            response.put("message", "Upload thành công");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            response.put("error", "Lỗi khi upload file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping(value = "/image/{fileName}", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getImage(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            byte[] imageBytes = Files.readAllBytes(filePath);
            return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(imageBytes);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}