package com.BTL_LTW.JanyPet.entity;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.common.SalesChannel;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.BatchSize;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "orders")
public class Order extends BaseEntity<String>{

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch; // Chi nhánh bán hàng

    @Column(name = "employee_name")
    private String employeeName; // Thay thế bằng lưu tên nhân viên trực tiếp

    @Column(name = "employee_code")
    private String employeeCode; // Mã nhân viên nếu cần

    @Column(name = "sales_channel")
    @Enumerated(EnumType.STRING)
    private SalesChannel salesChannel; // Kênh bán hàng (ONLINE, OFFLINE)

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    @JsonManagedReference
    private List<OrderDetail> orderDetails = new ArrayList<>();

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Payment payment;

    public void addOrderDetail(OrderDetail orderDetail) {
        orderDetails.add(orderDetail);
        orderDetail.setOrder(this);
    }

    // Helper method to create an order from shopping cart
    public static Order createFromCart(ShoppingCart cart, Customer customer) {
        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderDate(LocalDateTime.now());
        order.setTotalAmount(cart.getTotal());
        order.setStatus(OrderStatus.PENDING);

        // Convert cart details to order details
        for (CartDetail cartDetail : cart.getCartDetails()) {
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setProduct(cartDetail.getProduct());
            orderDetail.setQuantity(cartDetail.getQuantity());
            orderDetail.setUnitPrice(cartDetail.getUnitPrice());
            order.addOrderDetail(orderDetail);
        }

        return order;
    }

    public Customer getCustomer() {
        return customer;
    }
    
    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public List<OrderDetail> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(List<OrderDetail> orderDetails) {
        this.orderDetails = orderDetails;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public Branch getBranch() {
        return branch;
    }

    public void setBranch(Branch branch) {
        this.branch = branch;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public SalesChannel getSalesChannel() {
        return salesChannel;
    }

    public void setSalesChannel(SalesChannel salesChannel) {
        this.salesChannel = salesChannel;
    }
}