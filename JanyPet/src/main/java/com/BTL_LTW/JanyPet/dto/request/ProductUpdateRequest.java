package com.BTL_LTW.JanyPet.dto.request;

import jakarta.persistence.Transient;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public class ProductUpdateRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    @Transient
    private MultipartFile image;

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

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }
}
