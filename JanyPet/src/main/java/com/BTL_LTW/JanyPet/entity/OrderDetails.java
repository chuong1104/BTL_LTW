package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;

@Entity
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
public class OrderDetails extends BaseEntity<String>{

    @ManyToOne
    @JoinColumn(name="orderId", nullable = false)
    private Orders orders;

    @ManyToOne
    @JoinColumn(name="productId", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    private BigDecimal unitPrice;
    private BigDecimal discount = BigDecimal.ZERO;

    public Orders getOrders() {
        return orders;
    }

    public void setOrders(Orders orders) {
        this.orders = orders;
    }
}
