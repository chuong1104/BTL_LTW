package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.common.SalesChannel;
import com.BTL_LTW.JanyPet.dto.request.OrderCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.OrderUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.OrderDetailResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderListResponse;
import com.BTL_LTW.JanyPet.service.Interface.OrderService;
import jakarta.validation.Valid;
import jakarta.transaction.Transactional; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderDetailResponse> createOrder(@Valid @RequestBody OrderCreationRequest request) {
        OrderDetailResponse createdOrder = orderService.createOrder(request);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Transactional
    public ResponseEntity<OrderListResponse> getOrderById(@PathVariable String id) {
        OrderListResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{id}/detail")
    @Transactional
    public ResponseEntity<?> getOrderDetail(@PathVariable String id) {
        try {
            // Thêm debug log
            System.out.println("Fetching order details for ID: " + id);
            
            OrderDetailResponse order = orderService.getOrderDetail(id);
            
            // Log toàn bộ nội dung response
            System.out.println("Full order details response: " + order);
            
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            // In toàn bộ stack trace
            System.err.println("ERROR in getOrderDetail: " + e.getMessage());
            e.printStackTrace();
            
            // Trả về lỗi chi tiết
            Map<String, String> error = new HashMap<>();
            error.put("message", "Không thể lấy chi tiết đơn hàng: " + e.getMessage());
            error.put("exceptionType", e.getClass().getName());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDetailResponse> updateOrder(
            @PathVariable String id,
            @Valid @RequestBody OrderUpdateRequest request) {
        OrderDetailResponse updatedOrder = orderService.updateOrder(id, request);
        return ResponseEntity.ok(updatedOrder);
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public ResponseEntity<OrderListResponse> updateOrderStatus(
            @PathVariable String id,
            @RequestParam OrderStatus status) {
        // Thêm validation trạng thái
        OrderStatus currentStatus = orderService.getOrderById(id).getStatus();
        if (!isValidStatusTransition(currentStatus, status)) {
            return ResponseEntity.badRequest().build();
        }
        
        OrderListResponse updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }

    // Helper method to validate status transitions
    private boolean isValidStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        // Ví dụ: không thể chuyển từ CANCELLED hoặc COMPLETED sang trạng thái khác
        if (currentStatus == OrderStatus.CANCELLED || currentStatus == OrderStatus.COMPLETED) {
            return false;
        }
        
        // Không thể bỏ qua các bước
        if (currentStatus == OrderStatus.PENDING && newStatus == OrderStatus.COMPLETED) {
            return false;
        }
        
        return true;
    }

    @GetMapping
    @Transactional 
    public ResponseEntity<Page<OrderListResponse>> getAllOrders(
            @RequestParam(required = false) String branchId,
            @RequestParam(required = false) SalesChannel salesChannel,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<OrderListResponse> orders = orderService.getAllOrders(
            branchId, salesChannel, status, startDate, endDate, search, pageable
        );
        
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportOrdersToExcel(
            @RequestParam(required = false) String branchId,
            @RequestParam(required = false) SalesChannel salesChannel,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search) {
        
        byte[] excelFile = orderService.exportOrdersToExcel(branchId, salesChannel, status, startDate, endDate, search);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "orders.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return new ResponseEntity<>(excelFile, headers, HttpStatus.OK);
    }

    @GetMapping("/{id}/print")
    public ResponseEntity<OrderDetailResponse> printOrder(@PathVariable String id) {
        OrderDetailResponse orderDetail = orderService.getOrderDetail(id);
        return ResponseEntity.ok(orderDetail);
        // Trong thực tế, có thể sẽ trả về một PDF hoặc định dạng in khác
    }
}