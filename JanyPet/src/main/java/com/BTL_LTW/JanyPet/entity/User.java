package com.BTL_LTW.JanyPet.entity;


import com.BTL_LTW.JanyPet.common.Gender;
import jakarta.persistence.*;


import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "users")
public class User extends BaseEntity<Integer> {

    @Column(name= "username" ,nullable = false, length = 100)
    private String username;

    @Column(name="email",nullable = true, unique = true, length = 150)
    private String email;

    @Column(name = "password",nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "address",columnDefinition = "TEXT")
    private String address;

    @Column(name="phone_number",nullable = false, unique = true, length = 15)
    private String phoneNumber;

    @Column(name = "is_verified",nullable = false)
    private Boolean isVerified = false;

    // Thể hiện mối quan hệ 1 - N: user - userRole
    @OneToMany(mappedBy = "user",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserRole> UserRoles = new ArrayList<>();

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
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

    public Boolean getVerified() {
        return isVerified;
    }

    public void setVerified(Boolean verified) {
        isVerified = verified;
    }

    public List<UserRole> getUserRoles() {
        return UserRoles;
    }

    public void setUserRoles(List<UserRole> userRoles) {
        UserRoles = userRoles;
    }
}