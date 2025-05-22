package com.BTL_LTW.JanyPet.dto.request;

import com.BTL_LTW.JanyPet.common.Gender;
import com.BTL_LTW.JanyPet.common.Role;
import jakarta.validation.constraints.Size;

public class UserCreationRequest {
    private String username;
    private String email;
    @Size(min = 6, message = "INVALID_PASSWORD")
    private String password;
    private Gender gender;
    private String address;
    private String phoneNumber;
    private Role role;

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

    public @Size(min = 6, message = "INVALID_PASSWORD") String getPassword() {
        return password;
    }

    public void setPassword(@Size(min = 6, message = "INVALID_PASSWORD") String password) {
        this.password = password;
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }


}