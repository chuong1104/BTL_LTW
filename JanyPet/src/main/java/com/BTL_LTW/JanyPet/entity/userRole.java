package com.BTL_LTW.JanyPet.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.Data;

@Entity
@Data

public class userRole extends BaseEntity<Integer>{

    @ManyToOne
    @JoinColumn(name="userId", nullable = false)
    private user user;

    @ManyToOne
    @JoinColumn(name="roleId", nullable = false)
    private role role;

    @Column(name ="permission", columnDefinition = "TEXT")
    private String permission;
}
