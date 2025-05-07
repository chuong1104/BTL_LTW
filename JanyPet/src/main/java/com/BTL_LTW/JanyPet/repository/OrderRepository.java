package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional; 

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.customer.id = :customerId")
    Integer countByCustomerId(String customerId);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.customer.id = :customerId")
    BigDecimal sumTotalByCustomerId(String customerId);
    
    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId")
    List<Order> findByCustomerId(String customerId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderDetails od LEFT JOIN FETCH od.product p " +
       "LEFT JOIN FETCH o.branch LEFT JOIN FETCH o.customer " +
       "WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") String id);
    
    // Thêm phương thức này
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails WHERE o IN :orders")
    List<Order> findAllWithDetails(@Param("orders") List<Order> orders);
    
    Page<Order> findAll(Specification<Order> spec, Pageable pageable);
    
    List<Order> findAll(Specification<Order> spec);
}