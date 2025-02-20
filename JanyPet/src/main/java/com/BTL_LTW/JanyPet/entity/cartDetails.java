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
public class cartDetails extends BaseEntity<Integer> {

    @ManyToOne
    @JoinColumn(name = "shoppingCartid", nullable = false)
    private shoppingCart shoppingCart;

    @ManyToOne
    @JoinColumn(name="productId", nullable = false)
    private product product;

    private Integer quantity;

}
