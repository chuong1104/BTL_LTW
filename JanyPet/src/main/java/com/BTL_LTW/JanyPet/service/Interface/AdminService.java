package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.common.BookingStatus;
import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.BookingResponse;
import com.BTL_LTW.JanyPet.dto.response.DashboardStats;
import com.BTL_LTW.JanyPet.dto.response.PetResponse;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AdminService {

    // Dashboard statistics
    DashboardStats getDashboardStats();

    // User management
    List<UserResponse> getAllUsers(Role role, Boolean verified, Boolean active);
    UserResponse getUserById(String id);
    UserResponse updateUser(String id, UserUpdateRequest request);
    UserResponse toggleLockUser(String id, boolean locked);
    void deleteUser(String id);

    // Booking management
    List<BookingResponse> getAllBookings(BookingStatus status, LocalDate startDate, LocalDate endDate);
    BookingResponse getBookingById(String id);
    BookingResponse updateBookingStatus(String id, BookingStatus status);
    void deleteBooking(String id);

    // Pet management
    List<PetResponse> getAllPets();

    // Reports
    Map<String, Long> getBookingsByStatus(LocalDate startDate, LocalDate endDate);
    Map<String, Long> getBookingsByService(LocalDate startDate, LocalDate endDate);
    Map<String, Double> getRevenueByService(LocalDate startDate, LocalDate endDate);
    Map<String, Long> getBookingsByDay(LocalDate startDate, LocalDate endDate);
    Map<String, Double> getRevenueByDay(LocalDate startDate, LocalDate endDate);
}
