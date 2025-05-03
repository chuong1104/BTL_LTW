package com.BTL_LTW.JanyPet.dto.request;

import jakarta.persistence.Transient;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public class ProductUpdateRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal purchasePrice; // Thêm trường purchasePrice
    private String category; // Thêm trường category
    private Integer stock;
    @Transient
    private MultipartFile imageFile;
    private String imagePath;

    // Constructor
    public ProductUpdateRequest() {
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    // Getter và Setter cho purchasePrice
    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }
    
    // Getter và Setter cho category
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public MultipartFile getImageFile() {
        return imageFile;
    }

    public void setImageFile(MultipartFile imageFile) {
        this.imageFile = imageFile;
    }
    
    public String getImagePath() {
        return imagePath;
    }
    
    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
    
    // Để duy trì compatibility với code cũ
    public MultipartFile getImage() {
        return imageFile;
    }

    public void setImage(MultipartFile image) {
        this.imageFile = image;
    }
}