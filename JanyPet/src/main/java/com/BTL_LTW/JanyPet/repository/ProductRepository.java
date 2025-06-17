package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByName(String name);

    List<Product> findByCategory(String category);
}
