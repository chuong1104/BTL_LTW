package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, String> {
    // Find only active categories
    List<Category> findByIsActiveTrue();
    
    // Find a specific active category by ID
    Optional<Category> findByIdAndIsActiveTrue(String id);
}
