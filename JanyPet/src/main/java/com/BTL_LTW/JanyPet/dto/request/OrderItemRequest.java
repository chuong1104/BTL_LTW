package com.BTL_LTW.JanyPet.dto.request;

import java.math.BigDecimal;

public class OrderItemRequest {
    private String id; // Khớp với "id" từ frontend (đây là productId)
    private String name; // Khớp với "name"
    private BigDecimal price; // Khớp với "price"
    private String image; // Khớp với "image"
    private int quantity; // Khớp với "quantity"
    private String variant; // Khớp với "variant" (có thể là size, color, etc.)

    // Getters and Setters
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

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getVariant() {
        return variant;
    }

    public void setVariant(String variant) {
        this.variant = variant;
    }
}