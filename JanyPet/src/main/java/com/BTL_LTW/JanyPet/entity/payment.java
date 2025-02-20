package com.BTL_LTW.JanyPet.entity;

import com.BTL_LTW.JanyPet.common.PaymentMethod;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;
import java.time.Instant;

public class payment extends BaseEntity<Integer> {

    @ManyToOne
    @JoinColumn(name = "orderId",nullable = false)
    private orders orders;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    private BigDecimal amount;
    private Instant paymentDate;

}
