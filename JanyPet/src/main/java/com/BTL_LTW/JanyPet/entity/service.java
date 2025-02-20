package com.BTL_LTW.JanyPet.entity;


import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class service extends BaseEntity<Integer>{
    private String name;
    private String description;
    private BigDecimal price;
    private String images;
}
