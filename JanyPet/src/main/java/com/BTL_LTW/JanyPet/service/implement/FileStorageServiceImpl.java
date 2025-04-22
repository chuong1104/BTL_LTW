package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.service.Interface.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Autowired
    public FileStorageServiceImpl(@Value("${file.upload-dir:D:/BTL_LTW/uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
            System.out.println("File storage location: " + this.fileStorageLocation.toString());
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFileName.contains("..")) {
            throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
        }

        // Using timestamp for unique filenames
        String newFileName = System.currentTimeMillis() + "_" + originalFileName;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("File saved at: " + targetLocation.toString());
            return newFileName;
        } catch (IOException ex) {
            throw new IOException("Could not store file " + newFileName, ex);
        }
    }

    @Override
    public String getFileUrl(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return null;
        }

        // Direct URL to the uploads directory (leveraging the resource handler)
        return baseUrl + "/uploads/" + fileName;
    }

    @Override
    public void deleteFile(String fileName) throws IOException {
        if (fileName == null || fileName.isEmpty()) {
            return;
        }

        // Extract just the filename if a full URL was provided
        if (fileName.contains("/")) {
            fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
        }

        Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
        boolean deleted = Files.deleteIfExists(filePath);
        if (deleted) {
            System.out.println("File deleted successfully: " + filePath);
        } else {
            System.out.println("File not found for deletion: " + filePath);
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + fileName, ex);
        }
    }
}