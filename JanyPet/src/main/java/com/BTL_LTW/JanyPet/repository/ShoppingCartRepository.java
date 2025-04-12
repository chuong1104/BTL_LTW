package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.ShoppingCart;
import com.BTL_LTW.JanyPet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, String> {

    Optional<ShoppingCart> findByUser(User user);
}