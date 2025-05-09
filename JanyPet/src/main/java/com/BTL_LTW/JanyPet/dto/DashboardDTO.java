package com.BTL_LTW.JanyPet.dto;

import lombok.Data;

@Data
public class DashboardDTO {
    private int totalProducts;
    private int onlineOrders;
    private int offlineOrders;
    private int newCustomers;
    private double monthlyRevenue;

    // Dữ liệu so sánh với tháng trước
    private double productGrowth;
    private double onlineOrderGrowth;
    private double offlineOrderGrowth;
    private double customerGrowth;
    private double revenueGrowth;
}