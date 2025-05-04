package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    
    Optional<Customer> findByEmail(String email);
    
    Optional<Customer> findByPhoneNumber(String phoneNumber);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhoneNumber(String phoneNumber);
    
    Page<Customer> findByIsActive(Boolean isActive, Pageable pageable);
    
    Page<Customer> findByCustomerType(String customerType, Pageable pageable);
    
    Page<Customer> findByCustomerTypeAndIsActive(String customerType, Boolean isActive, Pageable pageable);
    
    @Query("SELECT c FROM Customer c WHERE " +
            "(:customerType IS NULL OR c.customerType = :customerType) AND " +
            "(:isActive IS NULL OR c.isActive = :isActive) AND " +
            "(:search IS NULL OR " +
            "LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Customer> findWithFilters(String customerType, Boolean isActive, String search, Pageable pageable);
    
    @Query("SELECT c FROM Customer c WHERE " +
            "LOWER(c.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.phoneNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.address) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Customer> search(String query, Pageable pageable);
    
    List<Customer> findByIsActiveTrue();
}