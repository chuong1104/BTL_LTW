package com.BTL_LTW.JanyPet.service;


import com.BTL_LTW.JanyPet.dto.DashboardDTO;
import com.BTL_LTW.JanyPet.repository.sqlserver.DashboardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private DashboardRepository dashboardRepository;

    public DashboardDTO getDashboardData() {
        DashboardDTO dto = new DashboardDTO();

        dto.setTotalProducts(dashboardRepository.getTotalProducts());
        dto.setOnlineOrders(dashboardRepository.getOnlineOrders());
        dto.setOfflineOrders(dashboardRepository.getOfflineOrders());
        dto.setNewCustomers(dashboardRepository.getNewCustomers());
        dto.setMonthlyRevenue(dashboardRepository.getMonthlyRevenue());

        // Lấy dữ liệu tăng trưởng
        dto.setProductGrowth(dashboardRepository.getProductGrowth());
        dto.setOnlineOrderGrowth(dashboardRepository.getOnlineOrderGrowth());
        dto.setOfflineOrderGrowth(dashboardRepository.getOfflineOrderGrowth());
        dto.setCustomerGrowth(dashboardRepository.getCustomerGrowth());
        dto.setRevenueGrowth(dashboardRepository.getRevenueGrowth());

        return dto;
    }
}