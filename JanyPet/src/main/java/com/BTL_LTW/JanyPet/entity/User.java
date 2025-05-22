package com.BTL_LTW.JanyPet.entity;

import com.BTL_LTW.JanyPet.common.Gender;
import com.BTL_LTW.JanyPet.common.Role;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User extends BaseEntity<String> implements UserDetails {

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "email", nullable = true, unique = true, length = 150)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;  // Lưu ADMIN, EMPLOYEE, CUSTOMER

    @Column(name = "phone_number", nullable = false, unique = true, length = 15)
    private String phoneNumber;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    private boolean isDeleted;
    private Boolean active;

    @Override
    public Boolean getActive() {
        return active;
    }

    @Override
    public void setActive(Boolean active) {
        this.active = active;
    }

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "token_expiry")
    private Long tokenExpiry;

    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked = false;

    // Constructor sửa để gán giá trị cho các trường
    public User(Boolean verified, String username, String password, boolean enabled, Collection<? extends GrantedAuthority> authorities, Gender gender) {
        this.isVerified = verified;
        this.username = username;
        this.password = password;
        this.isLocked = !enabled; // enabled = true nghĩa là tài khoản không bị khóa
        this.gender = gender;
    }

    // Constructor mặc định
    public User() {
    }

    // Constructor đầy đủ
    public User(Boolean isVerified, String username, String email, String password, Gender gender, String address, Role role, String phoneNumber, boolean isDeleted, String refreshToken, Long tokenExpiry, Boolean isLocked) {
        this.isVerified = isVerified;
        this.username = username;
        this.email = email;
        this.password = password;
        this.gender = gender;
        this.address = address;
        this.role = role;
        this.phoneNumber = phoneNumber;
        this.isDeleted = isDeleted;
        this.refreshToken = refreshToken;
        this.tokenExpiry = tokenExpiry;
        this.isLocked = isLocked;
    }

    // Getter và Setter

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getAuthority() {
        return role != null ? role.getAuthority() : null; // Trả về ROLE_ADMIN, ROLE_EMPLOYEE, ROLE_CUSTOMER
    }

    @Override
    public String getUsername() {
        // For authentication purposes, we need to return the identifier that was used for login
        // This could be either email or phone number
        // Since we don't know which one was used, we'll return the one that's not null
        // The actual login identifier will be determined by the UserDetailsService
        if (email != null && !email.isEmpty()) {
            return email;
        }
        return phoneNumber;
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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorityList = new ArrayList<>();
        if (role != null) { // Kiểm tra null để tránh lỗi
            // Đảm bảo thống nhất định dạng: ROLE_<ROLE_NAME>
            authorityList.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
        }
        return authorityList;
    }

    @Override
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

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public Long getTokenExpiry() {
        return tokenExpiry;
    }

    public void setTokenExpiry(Long tokenExpiry) {
        this.tokenExpiry = tokenExpiry;
    }

    public Boolean getLocked() {
        return isLocked;
    }

    public void setLocked(Boolean locked) {
        isLocked = locked;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isVerified;
    }
}
