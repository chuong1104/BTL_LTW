package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.common.SalesChannel;
import com.BTL_LTW.JanyPet.dto.request.OrderCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.OrderUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.OrderDetailResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderListResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

@Transactional
public interface OrderService {
    
    OrderDetailResponse createOrder(OrderCreationRequest request);
    
    OrderListResponse getOrderById(String id);
    
    OrderDetailResponse getOrderDetail(String id);
    
    OrderDetailResponse updateOrder(String id, OrderUpdateRequest request);
    
    OrderListResponse updateOrderStatus(String id, OrderStatus status);
    
    Page<OrderListResponse> getAllOrders(
        String branchId,
        SalesChannel salesChannel,
        OrderStatus status,
        LocalDate startDate,
        LocalDate endDate,
        String search,
        Pageable pageable
    );
    
    byte[] exportOrdersToExcel(
        String branchId,
        SalesChannel salesChannel,
        OrderStatus status,
        LocalDate startDate,
        LocalDate endDate,
        String search
    );
}