package com.BTL_LTW.JanyPet.dto.response;

import java.math.BigDecimal;

public class CartDetailResponse {
    private String cartDetailId;
    private String productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    // Constructors
    public CartDetailResponse() {}

    public CartDetailResponse(String cartDetailId, String productId, String productName,
                              Integer quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        this.cartDetailId = cartDetailId;
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
    }

    // Getters and setters
    public String getCartDetailId() {
        return cartDetailId;
    }

    public void setCartDetailId(String cartDetailId) {
        this.cartDetailId = cartDetailId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
