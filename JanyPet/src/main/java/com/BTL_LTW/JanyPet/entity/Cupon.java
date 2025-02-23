package com.BTL_LTW.JanyPet.entity;


import com.BTL_LTW.JanyPet.common.DiscountType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;


import java.math.BigDecimal;
import java.time.Instant;


@Entity

public class Cupon extends BaseEntity<Integer> {

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    private DiscountType discountType;

    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxOrderAmount;
    private Integer usageLimit;
    private Instant expirationDate;
}
