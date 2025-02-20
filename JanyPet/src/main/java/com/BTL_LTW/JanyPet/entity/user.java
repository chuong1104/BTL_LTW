package com.BTL_LTW.JanyPet.entity;


import com.BTL_LTW.JanyPet.common.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public class user extends BaseEntity<Integer> {

    @Column(name= "username" ,nullable = false, length = 100)
    private String username;

    @Column(name="email",nullable = false, unique = true, length = 150)
    @NotNull
    @Email
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
    private List<userRole> userRoles = new ArrayList<>();
}