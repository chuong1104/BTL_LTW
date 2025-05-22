package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.dto.request.OrderCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.OrderStatusUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.OrderResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderSummaryResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {
    // Tạo đơn hàng mới
    OrderResponse createOrder(OrderCreateRequest request);
    
    // Lấy thông tin chi tiết đơn hàng
    OrderResponse getOrderById(String id);
    
    // Lấy tất cả đơn hàng
    List<OrderSummaryResponse> getAllOrders();
    
    // Lấy đơn hàng theo người dùng
    List<OrderSummaryResponse> getOrdersByUserId(String userId);
    
    // Lấy đơn hàng theo trạng thái
    List<OrderSummaryResponse> getOrdersByStatus(OrderStatus status);
    
    // Lấy đơn hàng trong khoảng thời gian
    List<OrderSummaryResponse> getOrdersByDateRange(LocalDateTime start, LocalDateTime end);
    
    // Cập nhật trạng thái đơn hàng
    OrderResponse updateOrderStatus(String orderId, OrderStatusUpdateRequest request);
    
    // Hủy đơn hàng
    OrderResponse cancelOrder(String orderId);
    
//    // Lấy đơn hàng gần đây
//    List<OrderSummaryResponse> getRecentOrders(int limit);
    
    // Thống kê doanh thu trong khoảng thời gian
    Double getRevenueByDateRange(LocalDateTime start, LocalDateTime end);
    
    // Đếm số đơn hàng theo trạng thái
    Long countOrdersByStatus(OrderStatus status);
    
    // Thêm phương thức này vào OrderService interface
    void deleteOrder(String orderId);

    // Method to update order status after VNPAY payment
    boolean updateOrderStatusAfterVnPay(String orderCode, String vnpResponseCode, String vnpTransactionNo, String vnpBankCode, String vnpCardType, BigDecimal paidAmountVND);
}