package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.CartDetail;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.entity.ShoppingCart;
import com.BTL_LTW.JanyPet.entity.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartDetailRepository extends JpaRepository<CartDetail, String> {

}