package com.BTL_LTW.JanyPet.dto.respone;



import java.sql.Timestamp;

public class UserResponse {
    private Integer id;
    private String username;
    private String email;
    private String gender;
    private String address;
    private String phoneNumber;
    private Boolean isVerified;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public UserResponse(Integer id, String username, String email, String gender, String address, String phoneNumber, Boolean isVerified, Timestamp createdAt, Timestamp updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.gender = gender;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.isVerified = isVerified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
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

    public Boolean getVerified() {
        return isVerified;
    }

    public void setVerified(Boolean verified) {
        isVerified = verified;
    }

}
