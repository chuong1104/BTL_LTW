package com.BTL_LTW.JanyPet.dto.response;

import java.math.BigDecimal;

public class ProductResponse {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl; // Trả về URL đầy đủ để hiển thị trên giao diện
    private String categoryId;   // Added
    private String categoryName;
    private Boolean isActive; // Added

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCategoryId() { // Added
        return categoryId;
    }

    public void setCategoryId(String categoryId) { // Added
        this.categoryId = categoryId;
    }

    public String getCategoryName() { // Added
        return categoryName;
    }

    public void setCategoryName(String categoryName) { // Added
        this.categoryName = categoryName;
    }
    
    public Boolean getIsActive() { // Added
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) { // Added
        this.isActive = isActive;
    }
}