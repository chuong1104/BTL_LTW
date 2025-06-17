package com.BTL_LTW.JanyPet.dto.request;

import com.BTL_LTW.JanyPet.common.SalesChannel;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderCreationRequest {
    private String customerId; // Nullable for guest customers
    private String branchId; // Branch where order is placed
    private String employeeId; // Employee ID who creates the order
    private String employeeName; // Employee name directly instead of ID
    private String employeeCode; // Employee code if needed

    @NotNull(message = "Sales channel cannot be null")
    private SalesChannel salesChannel;

    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        @NotNull(message = "Product ID is required")
        private String productId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;
    }
}