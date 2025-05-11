package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class ServiceItem extends BaseEntity<String> {
    
    @Column(nullable = false)
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;
    
    private BigDecimal smallPetPrice;
    
    private BigDecimal mediumPetPrice;
    
    private BigDecimal largePetPrice;
    
    private BigDecimal xlargePetPrice;
    
    private Integer duration; // In minutes
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Service getService() {
        return service;
    }
    
    public void setService(Service service) {
        this.service = service;
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