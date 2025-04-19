package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.service.Interface.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;
    private final String fileAccessUrl;

    public FileStorageServiceImpl(
            @Value("${file.upload-dir:uploads}") String uploadDir,
            @Value("${file.access-url:http://localhost:8080/uploads/}") String fileAccessUrl) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.fileAccessUrl = fileAccessUrl;

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) throws IOException {
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        // Check if the file's name contains invalid characters
        if (originalFileName.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid path sequence " + originalFileName);
        }

        // Generate unique file name
        String fileExtension = "";
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Copy file to the target location
        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return fileAccessUrl + fileName;
    }

    @Override
    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.isEmpty() || !fileUrl.startsWith(fileAccessUrl)) {
            throw new IllegalArgumentException("Invalid file URL");
        }

        String fileName = fileUrl.substring(fileAccessUrl.length());
        Path filePath = this.fileStorageLocation.resolve(fileName);

        Files.deleteIfExists(filePath);
    }
}
