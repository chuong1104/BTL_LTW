package com.BTL_LTW.JanyPet.dto.request;

public class CartDetailCreationRequest {
    private String productId;
    private Integer quantity;

    // Constructors
    public CartDetailCreationRequest() {}

    public CartDetailCreationRequest(String productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    // Getters and setters
    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
