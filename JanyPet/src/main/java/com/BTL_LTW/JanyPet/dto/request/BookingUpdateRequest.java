package com.BTL_LTW.JanyPet.dto.request;

import com.BTL_LTW.JanyPet.common.BookingStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class BookingUpdateRequest {

    private String petId;

    private List<String> serviceIds;

    private LocalDate bookingDate;

    private LocalTime startTime;

    private BookingStatus status;

    private String notes;

    private String assignedStaffId;

    // --- getters & setters ---


    public String getPetId() {
        return petId;
    }

    public void setPetId(String petId) {
        this.petId = petId;
    }

    public List<String> getServiceIds() {
        return serviceIds;
    }

    public void setServiceIds(List<String> serviceIds) {
        this.serviceIds = serviceIds;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
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
