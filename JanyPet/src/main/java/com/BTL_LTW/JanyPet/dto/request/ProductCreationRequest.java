package com.BTL_LTW.JanyPet.dto.request;

import jakarta.persistence.Transient;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public class ProductCreationRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal purchasePrice; 
    private Integer stock;
    private MultipartFile imageFile;
    private String imagePath;
    private String category; 

    public ProductCreationRequest() {
    }

    public ProductCreationRequest(String name, String description, BigDecimal price, Integer stock, MultipartFile imageFile) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.imageFile = imageFile;
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

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }
    
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
}
