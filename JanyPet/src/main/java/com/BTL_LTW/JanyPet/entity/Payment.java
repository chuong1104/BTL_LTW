package com.BTL_LTW.JanyPet.entity;

import com.BTL_LTW.JanyPet.common.PaymentStatus;
import com.BTL_LTW.JanyPet.entity.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")

public class Payment extends BaseEntity<String> {



    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(name = "response_code")
    private String responseCode;

    @Column(name = "bank_code")
    private String bankCode;

    @Column(name = "payment_info")
    private String paymentInfo;





}