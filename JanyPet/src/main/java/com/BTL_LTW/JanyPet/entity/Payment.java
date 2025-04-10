package com.BTL_LTW.JanyPet.entity;

import com.BTL_LTW.JanyPet.common.PaymentMethod;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
public class Payment extends BaseEntity<String> {

    @ManyToOne
    @JoinColumn(name = "orderId",nullable = false)
    private Orders orders;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    private BigDecimal amount;
    private Instant paymentDate;

    public Orders getOrders() {
        return orders;
    }

    public void setOrders(Orders orders) {
        this.orders = orders;
    }

    public PaymentMethod getMethod() {
        return method;
    }

    public void setMethod(PaymentMethod method) {
        this.method = method;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Instant getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Instant paymentDate) {
        this.paymentDate = paymentDate;
    }
}
