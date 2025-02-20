package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.io.Serializable;
import java.sql.Timestamp;


@MappedSuperclass
@Data
public class BaseEntity<T extends Serializable> implements Serializable { //generic class, T la một kieu du lieu tuy chinh, Sizeable giup class co the duoc chuyen thanh byte stream

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    T id; // la thuoc tinh co du lieu tuy chinh (Interger, Long, String, UUID)

    @Column(name = "created_at",nullable = false, updatable = false)
    @CreationTimestamp
    private Timestamp createdAt;

    @Column(name="updated_at",nullable = false)
    @UpdateTimestamp
    private Timestamp updatedAt;

    @Column(name = "is_active",nullable = false)
    private Boolean isActive = true;

}