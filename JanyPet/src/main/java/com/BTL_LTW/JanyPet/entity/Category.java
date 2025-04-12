package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class Category extends BaseEntity<String>{
    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @Column(name="description", columnDefinition = "TEXT")
    private String description;

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
}