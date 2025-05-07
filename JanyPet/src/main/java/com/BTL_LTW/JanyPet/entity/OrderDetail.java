package com.BTL_LTW.JanyPet.entity;

import com.BTL_LTW.JanyPet.entity.BaseEntity;
import com.BTL_LTW.JanyPet.entity.Product;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_details")
public class OrderDetail extends BaseEntity<String> {

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    @Column(name = "purchase_price") 
    private BigDecimal purchasePrice;

    @Transient // Không lưu vào database
    public BigDecimal getProfit() {
        BigDecimal profit = unitPrice.subtract(purchasePrice).multiply(BigDecimal.valueOf(quantity));
        return profit.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : profit;
    }

    public BigDecimal getSubtotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }
    
    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }
}