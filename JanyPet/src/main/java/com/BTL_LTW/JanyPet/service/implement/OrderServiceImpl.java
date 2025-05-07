package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.common.SalesChannel;
import com.BTL_LTW.JanyPet.dto.request.OrderCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.OrderUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.OrderDetailResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderItemResponse;
import com.BTL_LTW.JanyPet.dto.response.OrderListResponse;
import com.BTL_LTW.JanyPet.entity.Branch;
import com.BTL_LTW.JanyPet.entity.Customer;
import com.BTL_LTW.JanyPet.entity.Order;
import com.BTL_LTW.JanyPet.entity.OrderDetail;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.exception.EntityNotFoundException;
import com.BTL_LTW.JanyPet.repository.BranchRepository;
import com.BTL_LTW.JanyPet.repository.CustomerRepository;
import com.BTL_LTW.JanyPet.repository.OrderDetailRepository;
import com.BTL_LTW.JanyPet.repository.OrderRepository;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.OrderService;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderDetailRepository orderDetailRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private BranchRepository branchRepository;
    
    @Override
    @Transactional
    public OrderDetailResponse createOrder(OrderCreationRequest request) {
        Order order = new Order();
        
        // Set ID using UUID
        order.setId(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        // Set customer if provided
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + request.getCustomerId()));
            order.setCustomer(customer);
        }
        
        // Set branch if provided
        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new EntityNotFoundException("Branch not found with id: " + request.getBranchId()));
            order.setBranch(branch);
        }
        
        // Set employee info directly instead of User reference
        if (request.getEmployeeName() != null) {
            order.setEmployeeName(request.getEmployeeName());
        }
        if (request.getEmployeeCode() != null) {
            order.setEmployeeCode(request.getEmployeeCode());
        }
        
        // Set sales channel
        order.setSalesChannel(request.getSalesChannel());
        
        // Rest of the method remains unchanged
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        
        // Save order to get ID
        Order savedOrder = orderRepository.save(order);
        
        // Add order details
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderDetail> orderDetails = new ArrayList<>();
        
        for (var itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + itemRequest.getProductId()));
            
            OrderDetail detail = new OrderDetail();
            detail.setOrder(savedOrder);
            detail.setProduct(product);
            detail.setQuantity(itemRequest.getQuantity());
            detail.setUnitPrice(product.getPrice());
            detail.setPurchasePrice(product.getPurchasePrice());
            
            orderDetails.add(detail);
            totalAmount = totalAmount.add(detail.getSubtotal());
        }
        
        // Save all order details
        orderDetailRepository.saveAll(orderDetails);
        
        // Update total amount
        savedOrder.setTotalAmount(totalAmount);
        orderRepository.save(savedOrder);

        Order refreshedOrder = orderRepository.findById(savedOrder.getId())
        .orElseThrow(() -> new EntityNotFoundException("Order not found after creation"));
        
        // Return response
        return mapToOrderDetailResponse(refreshedOrder);
    }

    @Override
    public OrderListResponse getOrderById(String id) {
        Order order = orderRepository.findByIdWithDetails(id)  // Sử dụng findByIdWithDetails thay vì findById
            .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        return mapToOrderListResponse(order);
    }
    @Override
    public OrderDetailResponse getOrderDetail(String id) {
        // Sử dụng phương thức mới với join fetch thay vì findById thông thường
        Order order = orderRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        return mapToOrderDetailResponse(order);
    }

    @Override
    @Transactional
    public OrderDetailResponse updateOrder(String id, OrderUpdateRequest request) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        
        // Update status if provided
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        
        // Update customer if provided
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + request.getCustomerId()));
            order.setCustomer(customer);
        }
        
        // Update branch if provided
        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new EntityNotFoundException("Branch not found with id: " + request.getBranchId()));
            order.setBranch(branch);
        }
        
        // Update employee info directly
        if (request.getEmployeeName() != null) {
            order.setEmployeeName(request.getEmployeeName());
        }
        
        if (request.getEmployeeCode() != null) {
            order.setEmployeeCode(request.getEmployeeCode());
        }
        
        // Update sales channel if provided
        if (request.getSalesChannel() != null) {
            order.setSalesChannel(request.getSalesChannel());
        }
        
        Order updatedOrder = orderRepository.save(order);
        return mapToOrderDetailResponse(updatedOrder);
    }

    @Override
    @Transactional
    public OrderListResponse updateOrderStatus(String id, OrderStatus status) {
        Order order = orderRepository.findByIdWithDetails(id)  // Sử dụng findByIdWithDetails thay vì findById
            .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        return mapToOrderListResponse(updatedOrder);
    }

    @Override
    public Page<OrderListResponse> getAllOrders(
            String branchId,
            SalesChannel salesChannel,
            OrderStatus status,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            Pageable pageable) {
        
        // Create specifications for filtering
        Specification<Order> spec = Specification.where(null);
        
        if (branchId != null && !branchId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("branch").get("id"), branchId));
        }
        
        if (salesChannel != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("salesChannel"), salesChannel));
        }
        
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        
        if (startDate != null) {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("orderDate"), startDateTime));
        }
        
        if (endDate != null) {
            LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.lessThan(root.get("orderDate"), endDateTime));
        }
        
        if (search != null && !search.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.or(
                    cb.like(root.get("id"), "%" + search + "%"),
                    cb.like(root.get("customer").get("fullName"), "%" + search + "%")
                )
            );
        }
        
        // Get page of orders
        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        List<Order> ordersWithDetails = orderRepository.findAllWithDetails(orderPage.getContent());
        
        // Map to response DTOs
        List<OrderListResponse> orderResponses = orderPage.getContent().stream()
            .map(this::mapToOrderListResponse)
            .collect(Collectors.toList());
        
        return new PageImpl<>(orderResponses, pageable, orderPage.getTotalElements());
    }

    @Override
    public byte[] exportOrdersToExcel(
            String branchId,
            SalesChannel salesChannel,
            OrderStatus status,
            LocalDate startDate,
            LocalDate endDate,
            String search) {
        
        // Create specifications for filtering (similar to getAllOrders method)
        Specification<Order> spec = Specification.where(null);
        
        // Add filters same as in getAllOrders
        if (branchId != null && !branchId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("branch").get("id"), branchId));
        }
        
        if (salesChannel != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("salesChannel"), salesChannel));
        }
        
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        
        if (startDate != null) {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("orderDate"), startDateTime));
        }
        
        if (endDate != null) {
            LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.lessThan(root.get("orderDate"), endDateTime));
        }
        
        if (search != null && !search.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.or(
                    cb.like(root.get("id"), "%" + search + "%"),
                    cb.like(root.get("customer").get("fullName"), "%" + search + "%")
                )
            );
        }
        
        // Get all filtered orders
        List<Order> orders = orderRepository.findAll(spec);
        
        // Create Excel workbook
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Orders");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Mã đơn hàng");
            headerRow.createCell(1).setCellValue("Ngày đặt");
            headerRow.createCell(2).setCellValue("Chi nhánh");
            headerRow.createCell(3).setCellValue("Kênh bán");
            headerRow.createCell(4).setCellValue("Khách hàng");
            headerRow.createCell(5).setCellValue("Nhân viên");
            headerRow.createCell(6).setCellValue("Tổng tiền");
            headerRow.createCell(7).setCellValue("Trạng thái");
            headerRow.createCell(8).setCellValue("Lợi nhuận");
            
            // Create data rows
            int rowNum = 1;
            for (Order order : orders) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(order.getId());
                row.createCell(1).setCellValue(
                    order.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                );
                row.createCell(2).setCellValue(order.getBranch() != null ? order.getBranch().getName() : "N/A");
                row.createCell(3).setCellValue(order.getSalesChannel() != null ? order.getSalesChannel().toString() : "N/A");
                row.createCell(4).setCellValue(order.getCustomer() != null ? order.getCustomer().getFullName() : "Khách vãng lai");
                row.createCell(5).setCellValue(order.getEmployeeName() != null ? order.getEmployeeName() : "N/A");
                
                // Create cell for total amount with currency format
                Cell totalCell = row.createCell(6);
                totalCell.setCellValue(order.getTotalAmount().doubleValue());
                
                row.createCell(7).setCellValue(order.getStatus().toString());
                
                // Calculate and add profit
                BigDecimal totalProfit = calculateOrderProfit(order);
                Cell profitCell = row.createCell(8);
                profitCell.setCellValue(totalProfit.doubleValue());
            }
            
            // Auto size columns
            for (int i = 0; i < 9; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    
    // Helper methods
    private OrderListResponse mapToOrderListResponse(Order order) {
        OrderListResponse response = new OrderListResponse();
        
        response.setId(order.getId());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setSalesChannel(order.getSalesChannel());
        
        // Set branch name if branch exists
        if (order.getBranch() != null) {
            response.setBranchName(order.getBranch().getName());
        }
        
        // Set employee name directly from order
        response.setEmployeeName(order.getEmployeeName());
        
        // Set customer name if customer exists
        if (order.getCustomer() != null) {
            response.setCustomerName(order.getCustomer().getFullName());
        }
        
        // Set total items
        response.setTotalItems(order.getOrderDetails().size());
        
        return response;
    }
    
    private OrderDetailResponse mapToOrderDetailResponse(Order order) {
        if (order.getOrderDetails() == null) {
            order.setOrderDetails(new ArrayList<>());
        }
        
        List<OrderItemResponse> itemResponses = order.getOrderDetails().stream()
            .map(detail -> {
                OrderItemResponse itemResponse = new OrderItemResponse(
                    detail.getProduct().getId(),
                    detail.getProduct().getName(),
                    detail.getProduct().getSku(),
                    detail.getQuantity(),
                    detail.getUnitPrice(),
                    detail.getPurchasePrice()
                );
                return itemResponse;
            })
            .collect(Collectors.toList());
        
        OrderDetailResponse response = new OrderDetailResponse();
        response.setId(order.getId());
        response.setOrderDate(order.getOrderDate());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setSalesChannel(order.getSalesChannel());
        response.setItems(itemResponses);
        
        // Set branch info if branch exists
        if (order.getBranch() != null) {
            response.setBranchName(order.getBranch().getName());
        }
        
        // Set employee info directly from order
        response.setEmployeeName(order.getEmployeeName());
        
        // Set customer info if customer exists
        if (order.getCustomer() != null) {
            response.setCustomerName(order.getCustomer().getFullName());
            response.setCustomerPhone(order.getCustomer().getPhoneNumber());
            response.setCustomerEmail(order.getCustomer().getEmail());
            // You might need to add a shipping address field to Customer entity
            // response.setShippingAddress(order.getCustomer().getAddress());
        }
        
        // Calculate total profit from order details
        BigDecimal totalProfit = calculateOrderProfit(order);
        response.setTotalProfit(totalProfit);
        
        return response;
    }
    
    private BigDecimal calculateOrderProfit(Order order) {
        if (order.getOrderDetails() == null) {
            return BigDecimal.ZERO;
        }
        
        return order.getOrderDetails().stream()
            .filter(detail -> detail != null && detail.getUnitPrice() != null)
            .map(detail -> {
                // Đảm bảo không có null values khi tính toán
                BigDecimal purchasePrice = detail.getPurchasePrice() != null ? 
                                         detail.getPurchasePrice() : BigDecimal.ZERO;
                BigDecimal unitPrice = detail.getUnitPrice() != null ?
                                     detail.getUnitPrice() : BigDecimal.ZERO;
                                     
                BigDecimal unitProfit = unitPrice.subtract(purchasePrice);
                int quantity = detail.getQuantity() != null ? detail.getQuantity() : 0;
                
                return unitProfit.multiply(BigDecimal.valueOf(quantity));
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}