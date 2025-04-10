package com.BTL_LTW.JanyPet.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;


import java.math.BigDecimal;
import java.time.Instant;

@Entity
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
public class Discount extends BaseEntity<String> {

    @ManyToOne
    @JoinColumn(name = "productId",nullable = false)
    private Product product;

    private BigDecimal discountPercent;
    private Instant startDate;
    private Instant endDate;

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public BigDecimal getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(BigDecimal discountPercent) {
        this.discountPercent = discountPercent;
    }

    public Instant getStartDate() {
        return startDate;
    }

    public void setStartDate(Instant startDate) {
        this.startDate = startDate;
    }

    public Instant getEndDate() {
        return endDate;
    }

    public void setEndDate(Instant endDate) {
        this.endDate = endDate;
    }
}
