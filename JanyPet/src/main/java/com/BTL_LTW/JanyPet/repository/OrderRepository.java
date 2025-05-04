package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.customer.id = :customerId")
    Integer countByCustomerId(String customerId);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.customer.id = :customerId")
    BigDecimal sumTotalByCustomerId(String customerId);
    
    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId")
    List<Order> findByCustomerId(String customerId);
    
    Page<Order> findAll(Specification<Order> spec, Pageable pageable);
    
    List<Order> findAll(Specification<Order> spec);
}