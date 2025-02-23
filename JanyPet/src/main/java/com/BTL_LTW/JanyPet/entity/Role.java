package com.BTL_LTW.JanyPet.entity;


import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;


import java.util.ArrayList;
import java.util.List;

@Entity
public class Role extends BaseEntity<Integer>{
    @Column(unique = true, nullable = false, length = 50)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany (mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserRole> UserRoles = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<UserRole> getUserRoles() {
        return UserRoles;
    }

    public void setUserRoles(List<UserRole> userRoles) {
        UserRoles = userRoles;
    }
}
