package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByName(String name);
    List<Product> findByNameContainingIgnoreCase(String nameKeyword); // Renamed parameter for clarity

    @Query("SELECT p FROM Product p WHERE lower(p.name) LIKE lower(concat('%', :keyword, '%')) OR lower(p.description) LIKE lower(concat('%', :keyword, '%'))")
    List<Product> searchProductsByKeyword(@Param("keyword") String keyword);

    List<Product> findTop5ByOrderByCreatedAtDesc();
}
