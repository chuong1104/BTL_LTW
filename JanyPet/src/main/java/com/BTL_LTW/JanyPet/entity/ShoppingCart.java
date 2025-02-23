package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;


@Entity

public class ShoppingCart extends BaseEntity<Long> {
    @ManyToOne
    @JoinColumn(name="userId", nullable = false)
    private User user;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
