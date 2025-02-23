package com.BTL_LTW.JanyPet.entity;


import jakarta.persistence.Entity;


import java.math.BigDecimal;

@Entity

public class Service extends BaseEntity<Integer>{
    private String name;
    private String description;
    private BigDecimal price;
    private String images;

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
}
