package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.common.PaymentMethod;
import com.BTL_LTW.JanyPet.common.ShippingMethod;
import com.BTL_LTW.JanyPet.dto.request.OrderCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.OrderItemRequest;
import com.BTL_LTW.JanyPet.dto.request.OrderStatusUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.OrderResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderSummaryResponse;
import com.BTL_LTW.JanyPet.entity.Order;
import com.BTL_LTW.JanyPet.entity.OrderDetail;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.exception.ResourceNotFoundException;
import com.BTL_LTW.JanyPet.mapper.Interface.OrderMapper;
import com.BTL_LTW.JanyPet.repository.OrderRepository;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.logging.Logger;

@Service
public class OrderServiceImpl implements OrderService {
    private static final Logger logger = Logger.getLogger(OrderServiceImpl.class.getName());

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository, OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderMapper = orderMapper;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {
        Order order = new Order();

        // User association
        if (request.getUserId() != null && !request.getUserId().isEmpty()) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
            order.setUser(user);
        }

        order.setOrderDate(LocalDateTime.now());
        order.setOrderCode(generateUniqueOrderCode());

        // Customer Info
        order.setCustomerFirstName(request.getCustomerFirstName());
        order.setCustomerLastName(request.getCustomerLastName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());

        // Shipping Info
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingCity(request.getShippingCity());
        order.setShippingDistrict(request.getShippingDistrict());
        order.setShippingWard(request.getShippingWard());
        order.setShippingMethod(request.getShippingMethod());
        order.setEstimatedDeliveryDate(estimateDeliveryDate(order.getOrderDate(), request.getShippingMethod()));

        // Payment Info
        order.setPaymentMethod(request.getPaymentMethod());
        order.setCouponCode(request.getCouponCode());
        order.setOrderNotes(request.getOrderNotes());

        // Order Items and Subtotal
        BigDecimal subtotalAmount = BigDecimal.ZERO;
        List<OrderDetail> orderDetails = new ArrayList<>();
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item.");
        }
        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException("Not enough stock for product: " + product.getName());
            }

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(itemRequest.getQuantity());
            detail.setUnitPrice(itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : product.getPrice());
            detail.setProductColor(itemRequest.getColor());
            detail.setProductSize(itemRequest.getSize());
            orderDetails.add(detail);
            subtotalAmount = subtotalAmount.add(detail.getSubtotal());
        }
        order.setOrderDetails(orderDetails);
        order.setSubtotalAmount(subtotalAmount);

        // Shipping Fee
        BigDecimal shippingFee = calculateShippingFee(request.getShippingMethod(), request.getShippingAddress() + ", " + request.getShippingWard() + ", " + request.getShippingDistrict() + ", " + request.getShippingCity());
        order.setShippingFee(shippingFee);

        // Discount
        BigDecimal discountAmount = calculateDiscount(request.getCouponCode(), subtotalAmount);
        order.setDiscountAmount(discountAmount);

        // Total Amount
        BigDecimal totalAmount = subtotalAmount.add(shippingFee).subtract(discountAmount);
        order.setTotalAmount(totalAmount);

        // Set initial status based on payment method
        if (request.getPaymentMethod() == PaymentMethod.VNPAY) {
            order.setStatus(OrderStatus.PENDING);
        } else if (request.getPaymentMethod() == PaymentMethod.COD) {
            order.setStatus(OrderStatus.PROCESSING);
        } else if (request.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
            order.setStatus(OrderStatus.PENDING);
        } else {
            order.setStatus(OrderStatus.PENDING);
        }

        Order savedOrder = orderRepository.save(order);

        return orderMapper.toDTO(savedOrder);
    }

    private String generateUniqueOrderCode() {
        return String.valueOf(System.currentTimeMillis()) + new Random().nextInt(10000);
    }

    private BigDecimal calculateShippingFee(ShippingMethod shippingMethod, String shippingAddress) {
        if (shippingMethod == ShippingMethod.FAST) return BigDecimal.valueOf(50000);
        if (shippingMethod == ShippingMethod.STANDARD) return BigDecimal.valueOf(30000);
        return BigDecimal.valueOf(30000);
    }

    private BigDecimal calculateDiscount(String couponCode, BigDecimal subtotal) {
        if (couponCode != null && couponCode.equalsIgnoreCase("DISCOUNT10")) {
            return subtotal.multiply(BigDecimal.valueOf(0.1));
        }
        return BigDecimal.ZERO;
    }

    private LocalDateTime estimateDeliveryDate(LocalDateTime orderDate, ShippingMethod shippingMethod) {
        int daysToAdd = switch (shippingMethod) {
            case STANDARD -> 5;
            case FAST -> 2;
            default -> 7;
        };
        return orderDate.plusDays(daysToAdd);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return orderMapper.toDTO(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(String orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }

        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }

    @Override
    @Transactional
    public boolean updateOrderStatusAfterVnPay(String orderCode, String vnpResponseCode, String vnpTransactionNo, String vnpBankCode, String vnpCardType, BigDecimal paidAmountVND) {
        Optional<Order> orderOptional = orderRepository.findByOrderCode(orderCode);
        if (orderOptional.isEmpty()) {
            logger.warning("Order not found with orderCode: " + orderCode);
            return false;
        }

        Order order = orderOptional.get();

        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.CANCELLED) {
            logger.info("Order " + orderCode + " already processed or cancelled. Current status: " + order.getStatus());
            return order.getStatus() == OrderStatus.PAID && "00".equals(vnpResponseCode);
        }

        if ("00".equals(vnpResponseCode)) {
            if (order.getTotalAmount().compareTo(paidAmountVND) != 0) {
                logger.warning("Amount mismatch for order " + orderCode + ". Expected: " + order.getTotalAmount() + ", Received: " + paidAmountVND);
            }

            order.setStatus(OrderStatus.PAID);
            order.setVnpTransactionNo(vnpTransactionNo);
            order.setVnpBankCode(vnpBankCode);
            order.setVnpCardType(vnpCardType);

            updateProductInventory(order);
            logger.info("Order " + orderCode + " payment successful. Status updated to PAID.");
        } else {
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            logger.info("Order " + orderCode + " payment failed. VNP Response Code: " + vnpResponseCode + ". Status updated to PAYMENT_FAILED.");
        }

        orderRepository.save(order);
        return "00".equals(vnpResponseCode);
    }

    @Transactional
    protected void updateProductInventory(Order order) {
        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Product product = detail.getProduct();
                if (product != null) {
                    int newQuantity = product.getStock() - detail.getQuantity();
                    if (newQuantity < 0) {
                        logger.severe("Inventory issue: Product " + product.getName() + " would have negative stock.");
                        throw new IllegalStateException("Not enough stock for product " + product.getName() + " during inventory update.");
                    }
                    product.setStock(newQuantity);
                    productRepository.save(product);
                }
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAllOrdersWithDetailsList(
                Sort.by(Sort.Direction.DESC, "orderDate"));
        logger.info("Retrieved " + orders.size() + " orders");
        return orderMapper.toSummaryDTOList(orders);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getOrdersByUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        List<Order> orders = orderRepository.findByUserIdWithDetailsList(userId,
                Sort.by(Sort.Direction.DESC, "orderDate"));
        logger.info("Retrieved " + orders.size() + " orders for user: " + userId);
        return orderMapper.toSummaryDTOList(orders);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getOrdersByStatus(OrderStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Order status cannot be null");
        }

        List<Order> orders = orderRepository.findByStatusWithDetailsList(status,
                Sort.by(Sort.Direction.DESC, "orderDate"));
        logger.info("Retrieved " + orders.size() + " orders with status: " + status);
        return orderMapper.toSummaryDTOList(orders);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> getOrdersByDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates cannot be null");
        }

        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        List<Order> orders = orderRepository.findByOrderDateBetweenWithDetailsList(
                start, end, Sort.by(Sort.Direction.DESC, "orderDate"));
        logger.info("Retrieved " + orders.size() + " orders between " + start + " and " + end);
        return orderMapper.toSummaryDTOList(orders);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String orderId) {
        if (orderId == null || orderId.isEmpty()) {
            throw new IllegalArgumentException("Order ID cannot be null or empty");
        }

        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() == OrderStatus.SHIPPED ||
                order.getStatus() == OrderStatus.DELIVERED ||
                order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);

        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.PROCESSING) {
            returnProductsToInventory(order);
        }

        Order updatedOrder = orderRepository.save(order);
        logger.info("Order cancelled successfully: " + orderId);
        return orderMapper.toDTO(updatedOrder);
    }

    @Override
    public Double getRevenueByDateRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates cannot be null");
        }

        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        Double revenue = orderRepository.getTotalRevenueInPeriod(start, end);

        if (revenue == null) {
            revenue = 0.0;
        }

        logger.info("Calculated revenue between " + start + " and " + end + ": " + revenue);
        return revenue;
    }

    @Override
    public Long countOrdersByStatus(OrderStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Order status cannot be null");
        }

        Long count = orderRepository.countByStatus(status);
        logger.info("Count of orders with status " + status + ": " + count);
        return count;
    }

    @Transactional
    protected void returnProductsToInventory(Order order) {
        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Product product = detail.getProduct();
                if (product != null) {
                    int newStock = product.getStock() + detail.getQuantity();
                    product.setStock(newStock);
                    productRepository.save(product);
                    logger.info("Returned " + detail.getQuantity() + " units of product " +
                            product.getName() + " to inventory");
                }
            }
        }
    }

    @Override
    public void deleteOrder(String orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }
        orderRepository.deleteById(orderId);
        logger.info("Order deleted with id: " + orderId);
    }
}