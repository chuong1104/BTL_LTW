package com.BTL_LTW.JanyPet.dto.response;

import com.BTL_LTW.JanyPet.common.Gender;
import com.BTL_LTW.JanyPet.common.Role;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public class UserResponse {
    private String username;
    private Role role;
    private String email;
    private Gender gender;
    private String address;
    private String phoneNumber;
    private boolean verified;
    private Timestamp createdAt; // Ngày tạo
    private Timestamp updatedAt; // Ngày cập nhật

    // Constructor đã cập nhật, thêm cả createdAt và updatedAt nếu có
    public UserResponse(String username, Role role, String email, Gender gender, String address,
                        String phoneNumber, boolean verified, Timestamp createdAt, Timestamp updatedAt) {
        this.username = username;
        this.role = role;
        this.email = email;
        this.gender = gender;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.verified = verified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Nếu không có thông tin createdAt/updatedAt trong constructor, vẫn có setter:
    public UserResponse(String username, Role role, String email, Gender gender, String address,
                        String phoneNumber, boolean verified) {
        this(username, role, email, gender, address, phoneNumber, verified, null, null);
    }

    // Getters and setters

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
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
}
