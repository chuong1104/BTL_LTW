package com.BTL_LTW.JanyPet.dto.request;

import com.BTL_LTW.JanyPet.common.DiscountType;
import java.math.BigDecimal;
import java.time.Instant;

public class CuponCreateRequest {
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxOrderAmount;
    private Integer usageLimit;
    private Instant expirationDate;

    // Getters và Setters
    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }
    public DiscountType getDiscountType() {
        return discountType;
    }
    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }
    public BigDecimal getDiscountValue() {
        return discountValue;
    }
    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }
    public BigDecimal getMinOrderAmount() {
        return minOrderAmount;
    }
    public void setMinOrderAmount(BigDecimal minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }
    public BigDecimal getMaxOrderAmount() {
        return maxOrderAmount;
    }
    public void setMaxOrderAmount(BigDecimal maxOrderAmount) {
        this.maxOrderAmount = maxOrderAmount;
    }
    public Integer getUsageLimit() {
        return usageLimit;
    }
    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }
    public Instant getExpirationDate() {
        return expirationDate;
    }
    public void setExpirationDate(Instant expirationDate) {
        this.expirationDate = expirationDate;
    }
}
