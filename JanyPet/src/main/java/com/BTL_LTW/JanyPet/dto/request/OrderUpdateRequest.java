package com.BTL_LTW.JanyPet.dto.request;

import com.BTL_LTW.JanyPet.common.OrderStatus;
import com.BTL_LTW.JanyPet.common.SalesChannel;

public class OrderUpdateRequest {
    private OrderStatus status;
    private String customerId;
    private String branchId;
    private String employeeName; // Thay thế employeeId bằng employeeName
    private String employeeCode;
    private SalesChannel salesChannel;
    
    // Getters and setters
    public OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(OrderStatus status) {
        this.status = status;
    }
    
    public String getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }
    
    public String getBranchId() {
        return branchId;
    }
    
    public void setBranchId(String branchId) {
        this.branchId = branchId;
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