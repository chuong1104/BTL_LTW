package com.BTL_LTW.JanyPet.service.Interface;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {

    /**
     * Store a file and return the URL
     */
    String storeFile(MultipartFile file) throws IOException;

    /**
     * Delete a file by URL
     */
    void deleteFile(String fileUrl) throws IOException;
}
