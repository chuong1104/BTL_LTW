package com.BTL_LTW.JanyPet.dto.request;

public class CartDetailUpdateRequest {
    private Integer quantity;

    // Constructors
    public CartDetailUpdateRequest() {}

    public CartDetailUpdateRequest(Integer quantity) {
        this.quantity = quantity;
    }

    // Getters and setters
    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
