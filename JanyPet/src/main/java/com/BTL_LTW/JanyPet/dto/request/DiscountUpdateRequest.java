package com.BTL_LTW.JanyPet.dto.request;

import java.math.BigDecimal;
import java.time.Instant;

public class DiscountUpdateRequest {
    private BigDecimal discountPercent;
    private Instant startDate;
    private Instant endDate;

    // Getters và Setters
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
