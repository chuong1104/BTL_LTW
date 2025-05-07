package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Transient;

import java.math.BigDecimal;

@Entity
public class Product extends BaseEntity<String> {
    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @Column(unique = true)
    private String sku; 
    
    @Column(precision = 10, scale = 2)
    private BigDecimal sellPrice;

    @Transient  // Mark as transient so it's not stored in the database
    private Integer stock = 0;

    @Column(length = 255) // Lưu tên file ảnh hoặc đường dẫn tương đối
    private String image;

    @Column(length = 100)
    private String category;

    

    public Product() {
    }

    public Product(String name, String description, BigDecimal price, Integer stock, String image) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.image = image;
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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
    
    public String getSku() {
        return sku != null ? sku : ""; // Trả về chuỗi rỗng thay vì null
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public BigDecimal getSellPrice() {
        return price; // Hoặc có thể return một trường sellPrice riêng nếu có
    }

    public void setSellPrice(BigDecimal sellPrice) {
        this.sellPrice = sellPrice; // Hoặc this.price = sellPrice;
    }
}