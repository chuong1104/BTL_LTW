package com.BTL_LTW.JanyPet.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class ShoppingCartResponse {
    private String cartId;
    private List<CartDetailResponse> cartDetails;
    private BigDecimal total;

    // Constructors
    public ShoppingCartResponse() {}

    public ShoppingCartResponse(String cartId, List<CartDetailResponse> cartDetails, BigDecimal total) {
        this.cartId = cartId;
        this.cartDetails = cartDetails;
        this.total = total;
    }

    // Getters and setters
    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        this.cartId = cartId;
    }

    public List<CartDetailResponse> getCartDetails() {
        return cartDetails;
    }

    public void setCartDetails(List<CartDetailResponse> cartDetails) {
        this.cartDetails = cartDetails;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}
