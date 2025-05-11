package com.BTL_LTW.JanyPet.dto.request;

import com.BTL_LTW.JanyPet.common.ServiceCategory;
import java.math.BigDecimal;
import java.util.List;

public class ServiceUpdateRequest {
    private String name;
    private String description;
    private BigDecimal basePrice;
    private BigDecimal smallPetPrice;
    private BigDecimal mediumPetPrice;
    private BigDecimal largePetPrice;
    private BigDecimal xlargePetPrice;
    private String images;
    private Integer maxPetsPerSlot;
    private Boolean requiresVaccination;
    private ServiceCategory category;
    private Boolean active;
    private Integer duration;
    private String availability;
    private String procedure;
    private Boolean isFeatured;
    private Boolean isPopular;
    private String benefits;
    private String iconClass;
    private String notes;
    private List<String> includedItems;
    
    // Getters and Setters - same as ServiceCreationRequest
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getBasePrice() {
        return basePrice;
    }
    
    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
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
    
    public String getImages() {
        return images;
    }
    
    public void setImages(String images) {
        this.images = images;
    }
    
    public Integer getMaxPetsPerSlot() {
        return maxPetsPerSlot;
    }
    
    public void setMaxPetsPerSlot(Integer maxPetsPerSlot) {
        this.maxPetsPerSlot = maxPetsPerSlot;
    }
    
    public Boolean getRequiresVaccination() {
        return requiresVaccination;
    }
    
    public void setRequiresVaccination(Boolean requiresVaccination) {
        this.requiresVaccination = requiresVaccination;
    }
    
    public ServiceCategory getCategory() {
        return category;
    }
    
    public void setCategory(ServiceCategory category) {
        this.category = category;
    }
    
    public Boolean getActive() {
        return active;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public String getAvailability() {
        return availability;
    }
    
    public void setAvailability(String availability) {
        this.availability = availability;
    }
    
    public String getProcedure() {
        return procedure;
    }
    
    public void setProcedure(String procedure) {
        this.procedure = procedure;
    }
    
    public Boolean getIsFeatured() {
        return isFeatured;
    }
    
    public void setIsFeatured(Boolean featured) {
        isFeatured = featured;
    }
    
    public Boolean getIsPopular() {
        return isPopular;
    }
    
    public void setIsPopular(Boolean popular) {
        isPopular = popular;
    }
    
    public String getBenefits() {
        return benefits;
    }
    
    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }
    
    public String getIconClass() {
        return iconClass;
    }
    
    public void setIconClass(String iconClass) {
        this.iconClass = iconClass;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public List<String> getIncludedItems() {
        return includedItems;
    }
    
    public void setIncludedItems(List<String> includedItems) {
        this.includedItems = includedItems;
    }
}
