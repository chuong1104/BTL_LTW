package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.Column;
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
public class productDetails extends BaseEntity<Integer>{

  @ManyToOne
  @JoinColumn(name="productId",nullable = false)
    private product product;


  @ManyToOne
  @JoinColumn(name="categoryId", nullable = false)
    private category category;

  @Column(nullable = false, length = 100)
    private String attributeKey;

  @Column(nullable = false, length = 255)
    private String attributeValue;
}
