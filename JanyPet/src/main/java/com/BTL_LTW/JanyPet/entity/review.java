package com.BTL_LTW.JanyPet.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class review extends BaseEntity<Integer>{

    @ManyToOne
    @JoinColumn(name = "userId",nullable = false)
    private user user;

    @ManyToOne
    @JoinColumn(name = "productId",nullable = false)
    private product product;

    private Integer rating;
    private String comment;
    private String image;

}
