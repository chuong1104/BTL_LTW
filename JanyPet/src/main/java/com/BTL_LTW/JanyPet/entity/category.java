package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class category extends BaseEntity<Integer>{
    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @Column(name="description", columnDefinition = "TEXT")
    private String description;
}