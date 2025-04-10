package com.BTL_LTW.JanyPet.dto.request;

import com.BTL_LTW.JanyPet.common.BookingStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class BookingCreationRequest {

    @NotNull(message = "User ID is required")
    private String userId;

    @NotNull(message = "Pet ID is required")
    private String petId;

    @NotNull(message = "At least one service is required")
    private List<String> serviceIds;

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    private BookingStatus status = BookingStatus.PENDING;

    private String notes;

    private String assignedStaffId;  // có thể null nếu chưa phân công

    // --- getters & setters ---

    public @NotNull(message = "User ID is required") String getUserId() {
        return userId;
    }

    public void setUserId(@NotNull(message = "User ID is required") String userId) {
        this.userId = userId;
    }

    public @NotNull(message = "Pet ID is required") String getPetId() {
        return petId;
    }

    public void setPetId(@NotNull(message = "Pet ID is required") String petId) {
        this.petId = petId;
    }

    public @NotNull(message = "At least one service is required") List<String> getServiceIds() {
        return serviceIds;
    }

    public void setServiceIds(@NotNull(message = "At least one service is required") List<String> serviceIds) {
        this.serviceIds = serviceIds;
    }

    public @NotNull(message = "Booking date is required") LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(@NotNull(message = "Booking date is required") LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public @NotNull(message = "Start time is required") LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(@NotNull(message = "Start time is required") LocalTime startTime) {
        this.startTime = startTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getAssignedStaffId() {
        return assignedStaffId;
    }

    public void setAssignedStaffId(String assignedStaffId) {
        this.assignedStaffId = assignedStaffId;
    }
}