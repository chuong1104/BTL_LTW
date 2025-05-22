package com.BTL_LTW.JanyPet.dto.response;

import java.math.BigDecimal;

public class ServiceItemResponse {
    private String id;
    private String name;
    private BigDecimal smallPetPrice;
    private BigDecimal mediumPetPrice;
    private BigDecimal largePetPrice;
    private BigDecimal xlargePetPrice;
    private Integer duration;
    
    // Constructor
    public ServiceItemResponse() {}
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public BigDecimal getSmallPetPrice() {
        return smallPetPrice;
    }
    
    public void setSmallPetPrice(BigDecimal smallPetPrice) {
        this.smallPetPrice = smallPetPrice;
    }
    
    public BigDecimal getMediumPetPrice() {
        return mediumPetPrice;
    }
    
    public void setMediumPetPrice(BigDecimal mediumPetPrice) {
        this.mediumPetPrice = mediumPetPrice;
    }
    
    public BigDecimal getLargePetPrice() {
        return largePetPrice;
    }
    
    public void setLargePetPrice(BigDecimal largePetPrice) {
        this.largePetPrice = largePetPrice;
    }
    
    public BigDecimal getXlargePetPrice() {
        return xlargePetPrice;
    }
    
    public void setXlargePetPrice(BigDecimal xlargePetPrice) {
        this.xlargePetPrice = xlargePetPrice;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
}