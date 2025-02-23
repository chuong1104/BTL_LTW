package com.BTL_LTW.JanyPet.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;


@Entity
public class CartDetails extends BaseEntity<Integer> {

    @ManyToOne
    @JoinColumn(name = "shoppingCartid", nullable = false)
    private ShoppingCart shoppingCart;

    @ManyToOne
    @JoinColumn(name="productId", nullable = false)
    private Product product;

    private Integer quantity;

}
