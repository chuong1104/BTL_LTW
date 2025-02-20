package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class orderDetails extends BaseEntity<Integer>{

    @ManyToOne
    @JoinColumn(name="orderId", nullable = false)
    private orders orders;

    @ManyToOne
    @JoinColumn(name="productId", nullable = false)
    private product product;

    @Column(nullable = false)
    private Integer quantity;

    private BigDecimal unitPrice;
    private BigDecimal discount = BigDecimal.ZERO;
}
