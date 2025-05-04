package com.BTL_LTW.JanyPet.dto.response;

public class CustomerSimpleResponse {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String customerType;
    private Boolean isActive;
    
    // Constructors
    public CustomerSimpleResponse() {
    }
    
    public CustomerSimpleResponse(String id, String fullName, String email, 
                                String phoneNumber, String customerType, Boolean isActive) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.customerType = customerType;
        this.isActive = isActive;
    }
    
    // Getters and setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getCustomerType() {
        return customerType;
    }
    
    public void setCustomerType(String customerType) {
        this.customerType = customerType;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}