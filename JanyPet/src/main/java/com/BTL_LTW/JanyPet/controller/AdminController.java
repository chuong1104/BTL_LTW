package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.common.BookingStatus;
import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.BookingResponse;
import com.BTL_LTW.JanyPet.dto.response.DashboardStats;
import com.BTL_LTW.JanyPet.dto.response.PetResponse;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;
import com.BTL_LTW.JanyPet.service.Interface.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Dashboard statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        DashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // User management
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active) {
        List<UserResponse> users = adminService.getAllUsers(role, null, active);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        UserResponse user = adminService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable String id,
            @RequestBody UserUpdateRequest request) {
        UserResponse updatedUser = adminService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/users/{id}/toggle-lock")
    public ResponseEntity<UserResponse> toggleLockUser(
            @PathVariable String id,
            @RequestParam boolean locked) {
        UserResponse user = adminService.toggleLockUser(id, locked);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Booking management
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<BookingResponse> bookings = adminService.getAllBookings(status, startDate, endDate);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String id) {
        BookingResponse booking = adminService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable String id,
            @RequestParam BookingStatus status) {
        BookingResponse booking = adminService.updateBookingStatus(id, status);
        return ResponseEntity.ok(booking);
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        adminService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    // Pet management
    @GetMapping("/pets")
    public ResponseEntity<List<PetResponse>> getAllPets() {
        List<PetResponse> pets = adminService.getAllPets();
        return ResponseEntity.ok(pets);
    }

    // Reports
    @GetMapping("/reports/bookings-by-status")
    public ResponseEntity<Map<String, Long>> getBookingsByStatus(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Long> report = adminService.getBookingsByStatus(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/bookings-by-service")
    public ResponseEntity<Map<String, Long>> getBookingsByService(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Long> report = adminService.getBookingsByService(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/revenue-by-service")
    public ResponseEntity<Map<String, Double>> getRevenueByService(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Double> report = adminService.getRevenueByService(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/bookings-by-day")
    public ResponseEntity<Map<String, Long>> getBookingsByDay(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Long> report = adminService.getBookingsByDay(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/revenue-by-day")
    public ResponseEntity<Map<String, Double>> getRevenueByDay(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Double> report = adminService.getRevenueByDay(startDate, endDate);
        return ResponseEntity.ok(report);
    }
}
