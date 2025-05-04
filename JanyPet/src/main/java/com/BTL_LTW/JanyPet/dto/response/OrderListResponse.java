package com.BTL_LTW.JanyPet.dto.response;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.common.PaymentStatus;
import com.BTL_LTW.JanyPet.common.SalesChannel;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderListResponse {
    private String id;
    private String branchName;  // Chi nhánh bán
    private SalesChannel salesChannel; // Kênh bán hàng
    private String employeeName; // Nhân viên bán hàng
    private String customerName; // Khách hàng
    private LocalDateTime orderDate; // Ngày đặt hàng
    private BigDecimal totalAmount; // Tổng tiền
    private OrderStatus status; // Trạng thái đơn hàng
    private PaymentStatus paymentStatus; // Trạng thái thanh toán
    private int totalItems; // Tổng số mặt hàng trong đơn

    // Constructors
    public OrderListResponse() {
    }

    public OrderListResponse(String id, String branchName, SalesChannel salesChannel, String employeeName, 
                            String customerName, LocalDateTime orderDate, BigDecimal totalAmount, 
                            OrderStatus status, PaymentStatus paymentStatus, int totalItems) {
        this.id = id;
        this.branchName = branchName;
        this.salesChannel = salesChannel;
        this.employeeName = employeeName;
        this.customerName = customerName;
        this.orderDate = orderDate;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentStatus = paymentStatus;
        this.totalItems = totalItems;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public SalesChannel getSalesChannel() {
        return salesChannel;
    }

    public void setSalesChannel(SalesChannel salesChannel) {
        this.salesChannel = salesChannel;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }
}