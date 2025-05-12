package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.dto.request.OrderCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.OrderItemRequest;
import com.BTL_LTW.JanyPet.dto.request.OrderStatusUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.OrderDetailResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderSummaryResponse;
import com.BTL_LTW.JanyPet.entity.Order;
import com.BTL_LTW.JanyPet.entity.OrderDetail;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.Interface.OrderMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.UserMapper;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapperImpl implements OrderMapper {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Override
    public OrderResponse toDTO(Order entity) {
        if (entity == null) {
            return null;
        }
        
        OrderResponse dto = new OrderResponse();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setOrderDate(entity.getOrderDate());
        dto.setStatus(entity.getStatus());
        
        
        // Customer info
        dto.setCustomerFirstName(entity.getCustomerFirstName());
        dto.setCustomerLastName(entity.getCustomerLastName());
        dto.setCustomerEmail(entity.getCustomerEmail());
        dto.setCustomerPhone(entity.getCustomerPhone());
        
        // Shipping info
        dto.setShippingAddress(entity.getShippingAddress());
        dto.setShippingCity(entity.getShippingCity());
        dto.setShippingDistrict(entity.getShippingDistrict());
        dto.setShippingWard(entity.getShippingWard());
        
        // Shipping method and fees
        dto.setShippingMethod(entity.getShippingMethod());
        dto.setShippingFee(entity.getShippingFee());
        dto.setEstimatedDeliveryDate(entity.getEstimatedDeliveryDate());
        
        // Payment and amount info
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setSubtotalAmount(entity.getSubtotalAmount());
        dto.setDiscountAmount(entity.getDiscountAmount());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setCouponCode(entity.getCouponCode());
        dto.setOrderNotes(entity.getOrderNotes());
        
        // Convert OrderDetails to OrderDetailResponses
        if (entity.getOrderDetails() != null) {
            List<OrderDetailResponse> detailResponses = entity.getOrderDetails().stream()
                .map(this::convertToOrderDetailResponse)
                .collect(Collectors.toList());
            
            dto.setOrderDetails(detailResponses);
        }
        
        return dto;
    }
    
    @Override
    public List<OrderResponse> toDTOList(List<Order> entities) {
        if (entities == null) {
            return new ArrayList<>();
        }
        
        return entities.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public OrderSummaryResponse toSummaryDTO(Order entity) {
        if (entity == null) {
            return null;
        }
        
        OrderSummaryResponse summary = new OrderSummaryResponse();
        summary.setId(entity.getId());
        summary.setOrderDate(entity.getOrderDate());
        // Set customer name by combining first and last names
        String customerName = String.format("%s %s", 
            entity.getCustomerFirstName() != null ? entity.getCustomerFirstName() : "",
            entity.getCustomerLastName() != null ? entity.getCustomerLastName() : "").trim();
        summary.setCustomerName(customerName);
        
        summary.setTotalAmount(entity.getTotalAmount());
        summary.setStatus(entity.getStatus());
        summary.setOrderCode(entity.getOrderCode());
        
        // Set item count from order details
        if (entity.getOrderDetails() != null) {
            summary.setItemCount(entity.getOrderDetails().size());
        } else {
            summary.setItemCount(0);
        }
        
        return summary;
    }
    
    @Override
    public List<OrderSummaryResponse> toSummaryDTOList(List<Order> entities) {
        if (entities == null) {
            return new ArrayList<>();
        }
        
        return entities.stream()
            .map(this::toSummaryDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public Order toEntity(OrderCreateRequest createDTO) {
        if (createDTO == null) {
            return null;
        }
        
        Order order = new Order();
        
        // Set basic order information
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(createDTO.getPaymentMethod().name().contains("CASH") ? 
            OrderStatus.PENDING :
            OrderStatus.PROCESSING);
        
        // Generate a unique order code (you might want to customize this)
        order.setOrderCode(generateOrderCode());
        
        // Set user if userId is provided
        if (createDTO.getUserId() != null) {
            userRepository.findById(createDTO.getUserId())
                .ifPresent(order::setUser);
        }
        
        // Set customer information
        order.setCustomerFirstName(createDTO.getCustomerFirstName());
        order.setCustomerLastName(createDTO.getCustomerLastName());
        order.setCustomerEmail(createDTO.getCustomerEmail());
        order.setCustomerPhone(createDTO.getCustomerPhone());
        
        // Set shipping information
        order.setShippingAddress(createDTO.getShippingAddress());
        order.setShippingCity(createDTO.getShippingCity());
        order.setShippingDistrict(createDTO.getShippingDistrict());
        order.setShippingWard(createDTO.getShippingWard());
        
        // Set shipping method and delivery information
        order.setShippingMethod(createDTO.getShippingMethod());
        // Calculate shipping fee based on shipping method
        order.setShippingFee(calculateShippingFee(createDTO.getShippingMethod()));
        // Estimate delivery date based on shipping method
        order.setEstimatedDeliveryDate(estimateDeliveryDate(createDTO.getShippingMethod()));
        
        // Set payment information
        order.setPaymentMethod(createDTO.getPaymentMethod());
        order.setCouponCode(createDTO.getCouponCode());
        order.setOrderNotes(createDTO.getOrderNotes());
        
        // Process order items
        if (createDTO.getItems() != null && !createDTO.getItems().isEmpty()) {
            BigDecimal subtotal = BigDecimal.ZERO;
            
            for (OrderItemRequest itemRequest : createDTO.getItems()) {
                OrderDetail orderDetail = createOrderDetail(itemRequest, order);
                if (orderDetail != null) {
                    order.addOrderDetail(orderDetail);
                    
                    // Add to subtotal
                    BigDecimal itemTotal = orderDetail.getUnitPrice()
                        .multiply(BigDecimal.valueOf(orderDetail.getQuantity()));
                    subtotal = subtotal.add(itemTotal);
                }
            }
            
            // Set financial information
            order.setSubtotalAmount(subtotal);
            
            // Calculate discount if coupon code is provided
            BigDecimal discount = calculateDiscount(subtotal, createDTO.getCouponCode());
            order.setDiscountAmount(discount);
            
            // Calculate total
            BigDecimal total = subtotal.subtract(discount).add(order.getShippingFee() != null ? 
                order.getShippingFee() : BigDecimal.ZERO);
            order.setTotalAmount(total);
        }
        
        return order;
    }
    
    @Override
    public void updateEntity(Order entity, OrderStatusUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) {
            return;
        }
        
        // Only update the status
        if (updateDTO.getStatus() != null) {
            entity.setStatus(updateDTO.getStatus());
        }
    }
    
    // Helper method to convert OrderDetail to OrderDetailResponse
    private OrderDetailResponse convertToOrderDetailResponse(OrderDetail detail) {
        if (detail == null) {
            return null;
        }
        
        OrderDetailResponse response = new OrderDetailResponse();
        response.setId(detail.getId());
        
        if (detail.getProduct() != null) {
            response.setProductId(detail.getProduct().getId());
        }
        
        response.setProductName(detail.getProductName());
        response.setProductImage(detail.getProductImage());
        response.setProductColor(detail.getProductColor());
        response.setProductSize(detail.getProductSize());
        response.setQuantity(detail.getQuantity());
        response.setUnitPrice(detail.getUnitPrice());
        response.setSubtotal(detail.getSubtotal());
        
        return response;
    }
    
    // Helper method to create an OrderDetail from OrderItemRequest
    private OrderDetail createOrderDetail(OrderItemRequest itemRequest, Order order) {
        if (itemRequest == null || itemRequest.getProductId() == null) {
            return null;
        }
        
        // Find the product
        Product product = productRepository.findById(itemRequest.getProductId()).orElse(null);
        if (product == null) {
            return null;
        }
        
        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setProduct(product);
        detail.setQuantity(itemRequest.getQuantity());
        
        // Set price - use provided price or fetch from product
        if (itemRequest.getUnitPrice() != null) {
            detail.setUnitPrice(itemRequest.getUnitPrice());
        } else {
            // Assume product has a getPrice() method - adjust accordingly
            detail.setUnitPrice(product.getPrice());
        }
        
        // Set variant information
        detail.setProductColor(itemRequest.getColor());
        detail.setProductSize(itemRequest.getSize());
        
        return detail;
    }
    
    // Helper method to generate an order code
    private String generateOrderCode() {
        // Simple implementation: timestamp + random number
        return "ORD" + System.currentTimeMillis() + 
               String.format("%04d", (int)(Math.random() * 10000));
    }
    
    // Helper method to calculate shipping fee
    private BigDecimal calculateShippingFee(com.BTL_LTW.JanyPet.common.ShippingMethod shippingMethod) {
        // Implement logic to calculate shipping fee based on method
        if (shippingMethod == null) {
            return BigDecimal.ZERO;
        }
        
        // Simple example - real implementation would be more complex
        switch (shippingMethod) {
            case STANDARD:
                return new BigDecimal("30000"); // 30,000 VND
            case FAST:
                return new BigDecimal("50000"); // 50,000 VND
            case SAME_DAY:
                return new BigDecimal("100000"); // 100,000 VND
            default:
                return BigDecimal.ZERO;
        }
    }
    
    // Helper method to estimate delivery date
    private LocalDateTime estimateDeliveryDate(com.BTL_LTW.JanyPet.common.ShippingMethod shippingMethod) {
        if (shippingMethod == null) {
            return null;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // Simple example - real implementation would be more complex
        switch (shippingMethod) {
            case STANDARD:
                return now.plusDays(3);
            case FAST:
                return now.plusDays(1);
            case SAME_DAY:
                return now.plusHours(6);
            default:
                return now.plusDays(5);
        }
    }
    
    // Helper method to calculate discount amount
    private BigDecimal calculateDiscount(BigDecimal subtotal, String couponCode) {
        // Implement coupon validation and discount calculation
        // This is a simple placeholder
        
        if (couponCode == null || couponCode.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        // In a real application, you would look up the coupon code in a database
        // and apply the appropriate discount
        
        // Example implementation
        if ("WELCOME10".equals(couponCode)) {
            // 10% discount
            return subtotal.multiply(new BigDecimal("0.1"));
        } else if ("FREESHIP".equals(couponCode)) {
            // Flat discount of 30,000 VND
            return new BigDecimal("30000");
        }
        
        return BigDecimal.ZERO;
    }
}