package com.BTL_LTW.JanyPet.dto.response;

import com.BTL_LTW.JanyPet.common.BookingStatus;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class BookingResponse  {

    private String id;

    private PetResponse pet;

    private UserResponse customer;

    private List<ServiceResponse> services;

    private LocalDate bookingDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private BookingStatus status;

    private String notes;

    private UserResponse assignedStaff;

    private Timestamp createdAt;
    private Timestamp updatedAt;

    public BookingResponse(String id, PetResponse pet, UserResponse customer, List<ServiceResponse> services, LocalDate bookingDate, LocalTime startTime, LocalTime endTime, BookingStatus status, String notes, UserResponse assignedStaff, Timestamp createdAt, Timestamp updatedAt) {
        this.id = id;
        this.pet = pet;
        this.customer = customer;
        this.services = services;
        this.bookingDate = bookingDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.notes = notes;
        this.assignedStaff = assignedStaff;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
    // --- getters & setters ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public PetResponse getPet() {
        return pet;
    }

    public void setPet(PetResponse pet) {
        this.pet = pet;
    }

    public UserResponse getCustomer() {
        return customer;
    }

    public void setCustomer(UserResponse customer) {
        this.customer = customer;
    }

    public List<ServiceResponse> getServices() {
        return services;
    }

    public void setServices(List<ServiceResponse> services) {
        this.services = services;
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

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
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

    public UserResponse getAssignedStaff() {
        return assignedStaff;
    }

    public void setAssignedStaff(UserResponse assignedStaff) {
        this.assignedStaff = assignedStaff;
    }
}
