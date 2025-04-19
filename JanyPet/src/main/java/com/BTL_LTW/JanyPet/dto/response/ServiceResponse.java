package com.BTL_LTW.JanyPet.dto.response;

import com.BTL_LTW.JanyPet.common.ServiceCategory;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class ServiceResponse {

    private String id;

    private String name;

    private String description;

    private BigDecimal price;

    private String images;

    private Integer maxPetsPerSlot;

    private Boolean requiresVaccination;

    private ServiceCategory category;

    private Boolean active;
    private Integer duration; // Duration in minutes

    public ServiceResponse() {

    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    // timestamps from BaseEntity
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public ServiceResponse(
            String id,
            String name,
            String description,
            BigDecimal price,
            String images,
            Integer maxPetsPerSlot,
            Boolean requiresVaccination,
            ServiceCategory category,
            Boolean active,
            Timestamp createdAt,
            Timestamp updatedAt
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.images = images;
        this.maxPetsPerSlot = maxPetsPerSlot;
        this.requiresVaccination = requiresVaccination;
        this.category = category;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }


    // --- getters & setters ---

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


    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }


}
