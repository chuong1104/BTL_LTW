package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.BookingCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.BookingUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.BookingResponse;
import com.BTL_LTW.JanyPet.entity.Booking;

import java.util.List;


public interface BookingService {
    BookingResponse create(BookingCreationRequest request);

    BookingResponse update(String id, BookingUpdateRequest req);

    BookingResponse updateStatus(String id, BookingUpdateRequest newStatus);

    BookingResponse getById(String id);

    List<BookingResponse> getAll();
    List<BookingResponse> getBookingsByUserId(String userId);

    void delete(String id);
}
