package com.BTL_LTW.JanyPet.entity;

import com.BTL_LTW.JanyPet.common.ServiceCategory;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
public class Service extends BaseEntity<String> {
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private BigDecimal basePrice;
    
    @Column(nullable = false)
    private BigDecimal smallPetPrice;
    
    @Column(nullable = false)
    private BigDecimal mediumPetPrice;
    
    @Column(nullable = false)
    private BigDecimal largePetPrice;
    
    @Column(nullable = false)
    private BigDecimal xlargePetPrice;
    
    @Column(columnDefinition = "TEXT")
    private String images;
    
    private Integer maxPetsPerSlot = 1;
    
    private Boolean requiresVaccination = false;
    
    @Enumerated(EnumType.STRING)
    private ServiceCategory category;
    
    private Boolean active = true;
    
    private Integer duration; // Duration in minutes
    
    private String availability; // Days of week available
    
    @Column(name = "service_procedure",columnDefinition = "TEXT")
    private String procedure; // Steps to perform the service
    
    private Boolean isFeatured = false;
    
    private Boolean isPopular = false;
    
    @Column(columnDefinition = "TEXT")
    private String benefits; // Benefits of the service
    
    @Column(columnDefinition = "TEXT")
    private String notes; // Additional notes/warnings
    
    @ElementCollection
    @CollectionTable(name = "service_included_items")
    @Column(name = "item")
    private List<String> includedItems; // Items included in the service
    
    @ManyToMany(mappedBy = "services")
    private Set<Booking> bookings = new HashSet<>();
    
    // Getters and Setters
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
    
    public Set<Booking> getBookings() {
        return bookings;
    }
    
    public void setBookings(Set<Booking> bookings) {
        this.bookings = bookings;
    }
}
