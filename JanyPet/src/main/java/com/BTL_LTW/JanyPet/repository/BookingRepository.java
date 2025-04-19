package com.BTL_LTW.JanyPet.repository;


import com.BTL_LTW.JanyPet.common.BookingStatus;
import com.BTL_LTW.JanyPet.entity.Booking;
import com.BTL_LTW.JanyPet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {


    List<Booking> findByUser(User user);

    long countByStatus(String pending);

    long countByBookingDate(LocalDate today);

    List<Booking> findByStatus(String completed);

    List<Booking> findByStatusAndBookingDateBetween(String status, LocalDate startDate, LocalDate endDate);

    List<Booking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);

    List<Booking> findByBookingDate(LocalDate today);

    List<Booking> findByStatusAndBookingDateGreaterThanEqual(BookingStatus status, LocalDate startDate);

    List<Booking> findByStatusAndBookingDateLessThanEqual(BookingStatus status, LocalDate endDate);

    List<Booking> findByBookingDateGreaterThanEqual(LocalDate startDate);

    List<Booking> findByBookingDateLessThanEqual(LocalDate endDate);
}


