package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.*;
//import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.io.Serializable;
import java.sql.Timestamp;


@MappedSuperclass
//@Data
public class BaseEntity<T extends Serializable> implements Serializable { //generic class, T la một kieu du lieu tuy chinh, Sizeable giup class co the duoc chuyen thanh byte stream

    @Id
    @GeneratedValue(strategy =GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, length = 36)
    T id; // la thuoc tinh co du lieu tuy chinh (Interger, Long, String, UUID)

    @Column(name = "created_at",nullable = false, updatable = false)
    @CreationTimestamp
    private Timestamp createdAt;

    @Column(name="updated_at",nullable = false)
    @UpdateTimestamp
    private Timestamp updatedAt;

    @Column(name = "is_active",nullable = false)
    private Boolean isActive = true;

    public String getId() {
        return (String) id;
    }

    public void setId(T id) {
        this.id = id;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }
}