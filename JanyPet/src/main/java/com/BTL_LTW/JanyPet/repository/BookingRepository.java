package com.BTL_LTW.JanyPet.repository;


import com.BTL_LTW.JanyPet.common.BookingStatus;
import com.BTL_LTW.JanyPet.entity.Booking;
import com.BTL_LTW.JanyPet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.services WHERE b.user = :user")
    List<Booking> findByUser(@Param("user") User user); 

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

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.services WHERE b.id = :id")
    Optional<Booking> findBookingWithServices(@Param("id") String id);
    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.user LEFT JOIN FETCH b.pet LEFT JOIN FETCH b.services LEFT JOIN FETCH b.assignedStaff WHERE b.id = :id")
    Optional<Booking> findByIdWithAllDetails(@Param("id") String id);

}


