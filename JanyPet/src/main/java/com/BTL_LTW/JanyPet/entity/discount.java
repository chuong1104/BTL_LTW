package com.BTL_LTW.JanyPet.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.security.PrivateKey;
import java.security.Timestamp;
import java.time.Instant;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class discount extends BaseEntity<Integer> {

    @ManyToOne
    @JoinColumn(name = "productId",nullable = false)
    private product product;

    private BigDecimal discountPercent;
    private Instant startDate;
    private Instant endDate;

}
