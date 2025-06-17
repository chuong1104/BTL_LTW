package com.BTL_LTW.JanyPet.dto.request;

public class BranchRequest {
    private String name;
    private String branchSourceId;
    private String address;
    private String district;
    private String city;
    private String phoneNumber;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBranchSourceId() {
        return branchSourceId;
    }

    public void setBranchSourceId(String branchSourceId) {
        this.branchSourceId = branchSourceId;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}