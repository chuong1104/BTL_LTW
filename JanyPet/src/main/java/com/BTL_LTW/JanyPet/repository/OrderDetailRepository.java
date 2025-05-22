package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, String> {
    // Tìm chi tiết đơn hàng theo orderId
    List<OrderDetail> findByOrderId(String orderId);
    
    // Tìm chi tiết đơn hàng theo productId
    List<OrderDetail> findByProductId(String productId);
    
    // Đếm số lần sản phẩm được mua
    @Query("SELECT COUNT(od) FROM OrderDetail od WHERE od.product.id = ?1")
    Long countPurchasesByProductId(String productId);
    
    // Tính tổng số lượng sản phẩm đã bán
    @Query("SELECT SUM(od.quantity) FROM OrderDetail od WHERE od.product.id = ?1")
    Long getTotalQuantitySoldByProductId(String productId);
}