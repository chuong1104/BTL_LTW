package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByName(String name);
    List<Product> findByNameContainingIgnoreCase(String nameKeyword); // Renamed parameter for clarity

    @Query("SELECT p FROM Product p WHERE lower(p.name) LIKE lower(concat('%', :keyword, '%')) OR lower(p.description) LIKE lower(concat('%', :keyword, '%'))")
    List<Product> searchProductsByKeyword(@Param("keyword") String keyword);

    List<Product> findTop5ByOrderByCreatedAtDesc();

    // Fix the active products methods using isActive field directly
    List<Product> findByIsActiveTrue();
    Optional<Product> findByIdAndIsActiveTrue(String id);
    List<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    // Add these additional methods if needed 
    List<Product> findByCategoryId(String categoryId);
    List<Product> findByCategoryIdAndIsActiveTrue(String categoryId);
}
