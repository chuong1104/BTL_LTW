package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.dto.request.OrderCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.OrderStatusUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ListResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderSummaryResponse;
import com.BTL_LTW.JanyPet.service.Interface.OrderService;
import com.BTL_LTW.JanyPet.service.implement.OrderServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String orderId) {
        OrderResponse response = orderService.getOrderById(orderId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<List<OrderSummaryResponse>> getAllOrders() {
        List<OrderSummaryResponse> response = orderService.getAllOrders();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderSummaryResponse>> getOrdersByUserId(
            @PathVariable String userId) {
        List<OrderSummaryResponse> response = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderSummaryResponse>> getOrdersByStatus(
            @PathVariable OrderStatus status) {
        List<OrderSummaryResponse> response = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<OrderSummaryResponse>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<OrderSummaryResponse> response = orderService.getOrdersByDateRange(start, end);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse response = orderService.updateOrderStatus(orderId, request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable String orderId) {
        OrderResponse response = orderService.cancelOrder(orderId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }

//    @GetMapping("/recent")
//    public ResponseEntity<List<OrderSummaryResponse>> getRecentOrders(
//            @RequestParam(defaultValue = "5") int limit) {
//        List<OrderSummaryResponse> response = orderService.getRecentOrders(limit);
//        return ResponseEntity.ok(response);
//    }
    
    @GetMapping("/revenue")
    public ResponseEntity<Double> getRevenueByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        Double revenue = orderService.getRevenueByDateRange(start, end);
        return ResponseEntity.ok(revenue);
    }
    
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> countOrdersByStatus(@PathVariable OrderStatus status) {
        Long count = orderService.countOrdersByStatus(status);
        return ResponseEntity.ok(count);
    }
}