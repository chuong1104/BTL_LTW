package com.BTL_LTW.JanyPet.entity;

import com.BTL_LTW.JanyPet.common.BookingStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.Instant;

public class booking extends BaseEntity<Integer>{

    @ManyToOne
    @JoinColumn(name = "userId",nullable = false)
    private user user;

    @ManyToOne
    @JoinColumn(name = "serviceId",nullable = false)
    private service service;

    private Instant bookingDate;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;
}
