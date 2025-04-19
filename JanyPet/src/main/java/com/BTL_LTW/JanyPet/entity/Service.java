package com.BTL_LTW.JanyPet.entity;

import com.BTL_LTW.JanyPet.common.ServiceCategory;
import com.BTL_LTW.JanyPet.entity.BaseEntity;
import com.BTL_LTW.JanyPet.entity.Booking;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Service extends BaseEntity<String> {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(columnDefinition = "TEXT")
    private String images;

    private Integer maxPetsPerSlot = 1;

    private Boolean requiresVaccination = false;

    @Enumerated(EnumType.STRING)
    private ServiceCategory category;

    private Boolean active = true;

    private Integer duration; // Duration in minutes

    private String availability; // Days of week available

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

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
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

    public Set<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(Set<Booking> bookings) {
        this.bookings = bookings;
    }
}
