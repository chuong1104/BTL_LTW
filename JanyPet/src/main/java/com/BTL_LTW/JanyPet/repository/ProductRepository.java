package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;



import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {
    // Find only active products
    List<Product> findByIsActiveTrue();
    
    // Find a specific active product by ID
    Optional<Product> findByIdAndIsActiveTrue(String id);
    
    // Modified search methods to include active status
    List<Product> findByNameAndIsActiveTrue(String name);
    List<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String nameKeyword);

    @Query("SELECT p FROM Product p WHERE (lower(p.name) LIKE lower(concat('%', :keyword, '%')) OR lower(p.description) LIKE lower(concat('%', :keyword, '%'))) AND p.isActive = true")
    List<Product> searchProductsByKeyword(@Param("keyword") String keyword);

    List<Product> findTop5ByIsActiveTrueOrderByCreatedAtDesc();

    // New methods for filtering with pagination
    Page<Product> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    Page<Product> findByCategoryIdAndIsActiveTrue(String categoryId, Pageable pageable);
    Page<Product> findByIsActiveTrue(Pageable pageable);
}
