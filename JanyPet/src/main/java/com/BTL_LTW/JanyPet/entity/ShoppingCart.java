package com.BTL_LTW.JanyPet.entity;

import com.BTL_LTW.JanyPet.entity.BaseEntity;
import com.BTL_LTW.JanyPet.entity.CartDetail;
import com.BTL_LTW.JanyPet.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shopping_carts")
public class ShoppingCart extends BaseEntity<String> {

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "shoppingCart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartDetail> cartDetails = new ArrayList<>();

    @Column(name = "total")
    private BigDecimal total = BigDecimal.ZERO;

    public void updateTotal() {
        this.total = cartDetails.stream()
                .map(CartDetail::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void addCartDetail(CartDetail cartDetail) {
        cartDetails.add(cartDetail);
        cartDetail.setShoppingCart(this); // ✔ đúng: gán cart hiện tại cho cartDetail
        updateTotal();
    }


    public void removeCartDetail(CartDetail cartDetail) {
        cartDetails.remove(cartDetail);
        cartDetail.setShoppingCart(null);
        updateTotal();
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<CartDetail> getCartDetails() {
        return cartDetails;
    }

    public void setCartDetails(List<CartDetail> cartDetails) {
        this.cartDetails = cartDetails;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}