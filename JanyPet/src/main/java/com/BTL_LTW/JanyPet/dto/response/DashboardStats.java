package com.BTL_LTW.JanyPet.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public class DashboardStats {
    private long totalBookings;
    private long pendingBookings;
    private long todayBookings;
    private long totalCustomers;
    private long totalPets;
    private long totalServices;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal weeklyRevenue;
    private BigDecimal dailyRevenue;
    private Map<String, Long> bookingsByStatus;
    private Map<String, Long> bookingsByService;
    private Map<String, BigDecimal> revenueByService;
    private Map<String, Long> bookingsByDay;
    private Map<String, BigDecimal> revenueByDay;
    private double growthRate;

    // Getters and Setters
    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getTodayBookings() {
        return todayBookings;
    }

    public void setTodayBookings(long todayBookings) {
        this.todayBookings = todayBookings;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalPets() {
        return totalPets;
    }

    public void setTotalPets(long totalPets) {
        this.totalPets = totalPets;
    }

    public long getTotalServices() {
        return totalServices;
    }

    public void setTotalServices(long totalServices) {
        this.totalServices = totalServices;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(BigDecimal monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public BigDecimal getWeeklyRevenue() {
        return weeklyRevenue;
    }

    public void setWeeklyRevenue(BigDecimal weeklyRevenue) {
        this.weeklyRevenue = weeklyRevenue;
    }

    public BigDecimal getDailyRevenue() {
        return dailyRevenue;
    }

    public void setDailyRevenue(BigDecimal dailyRevenue) {
        this.dailyRevenue = dailyRevenue;
    }

    public Map<String, Long> getBookingsByStatus() {
        return bookingsByStatus;
    }

    public void setBookingsByStatus(Map<String, Long> bookingsByStatus) {
        this.bookingsByStatus = bookingsByStatus;
    }

    public Map<String, Long> getBookingsByService() {
        return bookingsByService;
    }

    public void setBookingsByService(Map<String, Long> bookingsByService) {
        this.bookingsByService = bookingsByService;
    }

    public Map<String, BigDecimal> getRevenueByService() {
        return revenueByService;
    }

    public void setRevenueByService(Map<String, BigDecimal> revenueByService) {
        this.revenueByService = revenueByService;
    }

    public Map<String, Long> getBookingsByDay() {
        return bookingsByDay;
    }

    public void setBookingsByDay(Map<String, Long> bookingsByDay) {
        this.bookingsByDay = bookingsByDay;
    }

    public Map<String, BigDecimal> getRevenueByDay() {
        return revenueByDay;
    }

    public void setRevenueByDay(Map<String, BigDecimal> revenueByDay) {
        this.revenueByDay = revenueByDay;
    }

    public double getGrowthRate() {
        return growthRate;
    }

    public void setGrowthRate(double growthRate) {
        this.growthRate = growthRate;
    }
}
