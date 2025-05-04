package com.BTL_LTW.JanyPet.dto.response;

import java.math.BigDecimal;

public class OrderItemResponse {
    private String productId;
    private String productName;
    private String productSku;
    private Integer quantity;
    private BigDecimal unitPrice;   // Giá bán
    private BigDecimal purchasePrice; // Giá nhập (có thể ẩn đi với người dùng thường)
    private BigDecimal totalPrice;  // Thành tiền (unitPrice * quantity)
    private BigDecimal profit;      // Lợi nhuận [(unitPrice - purchasePrice) * quantity]

    // Constructors
    public OrderItemResponse() {
    }

    public OrderItemResponse(String productId, String productName, String productSku,
                           Integer quantity, BigDecimal unitPrice, BigDecimal purchasePrice) {
        this.productId = productId;
        this.productName = productName;
        this.productSku = productSku;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.purchasePrice = purchasePrice;
        
        // Tự động tính toán totalPrice và profit
        this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        
        BigDecimal itemProfit = unitPrice.subtract(purchasePrice).multiply(BigDecimal.valueOf(quantity));
        this.profit = itemProfit.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : itemProfit;
    }

    // Getters and Setters
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

    public String getProductSku() {
        return productSku;
    }

    public void setProductSku(String productSku) {
        this.productSku = productSku;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        // Tự động cập nhật totalPrice và profit khi quantity thay đổi
        if (this.unitPrice != null && this.purchasePrice != null) {
            this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(quantity));
            
            BigDecimal newProfit = this.unitPrice.subtract(this.purchasePrice)
                    .multiply(BigDecimal.valueOf(quantity));
            this.profit = newProfit.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : newProfit;
        }
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        // Cập nhật tính toán khi giá bán thay đổi
        if (this.quantity != null) {
            this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(this.quantity));
            
            if (this.purchasePrice != null) {
                BigDecimal newProfit = unitPrice.subtract(this.purchasePrice)
                        .multiply(BigDecimal.valueOf(this.quantity));
                this.profit = newProfit.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : newProfit;
            }
        }
    }

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
        // Cập nhật profit khi giá nhập thay đổi
        if (this.unitPrice != null && this.quantity != null) {
            BigDecimal newProfit = this.unitPrice.subtract(purchasePrice)
                    .multiply(BigDecimal.valueOf(this.quantity));
            this.profit = newProfit.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : newProfit;
        }
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public BigDecimal getProfit() {
        return profit;
    }

    public void setProfit(BigDecimal profit) {
        this.profit = profit;
    }
}