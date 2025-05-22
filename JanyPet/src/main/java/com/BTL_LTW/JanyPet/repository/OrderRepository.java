package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort; // Import Sort
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    // Tìm đơn hàng theo userId
    Page<Order> findByUserId(String userId, Pageable pageable);
    
    // Tìm đơn hàng theo trạng thái
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    // Tìm đơn hàng theo ngày đặt hàng trong khoảng thời gian
    Page<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    // Tìm đơn hàng theo SĐT khách hàng
    List<Order> findByCustomerPhone(String customerPhone);
    
    // Tìm đơn hàng theo email khách hàng
    List<Order> findByCustomerEmail(String customerEmail);
    
    // Đếm số đơn hàng theo trạng thái
    Long countByStatus(OrderStatus status);
    
    // Tìm đơn hàng mới nhất (paginated)
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    Page<Order> findRecentOrders(Pageable pageable);
    
    // Tổng doanh thu trong khoảng thời gian
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderDate BETWEEN ?1 AND ?2 AND o.status = 'COMPLETED'")
    Double getTotalRevenueInPeriod(LocalDateTime start, LocalDateTime end);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderDetails WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") String id);

    // Add this query method
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderDetails WHERE o.id IN :ids")
    List<Order> findOrdersWithDetailsByIds(@Param("ids") List<String> ids);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails")
    Page<Order> findAllOrdersWithDetails(Pageable pageable);

    // New methods for fetching lists without pagination but with details and sorting
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails")
    List<Order> findAllOrdersWithDetailsList(Sort sort);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails WHERE o.user.id = :userId")
    List<Order> findByUserIdWithDetailsList(@Param("userId") String userId, Sort sort);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails WHERE o.status = :status")
    List<Order> findByStatusWithDetailsList(@Param("status") OrderStatus status, Sort sort);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails WHERE o.orderDate BETWEEN :start AND :end")
    List<Order> findByOrderDateBetweenWithDetailsList(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Sort sort);

    // New method for recent orders with a limit, fetching details
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderDetails ORDER BY o.orderDate DESC")
    List<Order> findTopNRecentOrdersWithDetails(Pageable pageable); // Spring Data JPA will use Pageable's size as limit

    Optional<Order> findByOrderCode(String orderCode); // Assuming orderCode is your vnp_TxnRef
    // Or: Optional<Order> findByVnpTxnRef(String vnpTxnRef);
    
}
