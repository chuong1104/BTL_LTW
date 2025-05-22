package com.BTL_LTW.JanyPet.dto.request;

import com.BTL_LTW.JanyPet.common.OrderStatus;

public class OrderStatusUpdateRequest {
    private OrderStatus status;

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}