package com.BTL_LTW.JanyPet.common;

public enum OrderStatus {
    PENDING, // Order created, waiting for payment
    PAID,            // Payment successful
    PAYMENT_FAILED,  // Payment failed
    PROCESSING,      // Order is being processed (after payment)
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REFUNDED,
    COMPLETED
}
