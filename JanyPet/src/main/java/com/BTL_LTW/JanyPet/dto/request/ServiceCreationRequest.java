package com.BTL_LTW.JanyPet.dto.request;

import com.BTL_LTW.JanyPet.common.ServiceCategory;

import java.math.BigDecimal;

public class ServiceCreationRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private String images;
    private Integer maxPetsPerSlot;
    private Boolean requiresVaccination;
    private ServiceCategory category;
    private Boolean active;

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
}
