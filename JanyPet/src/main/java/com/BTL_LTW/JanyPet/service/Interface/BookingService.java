package com.BTL_LTW.JanyPet.service;

import com.BTL_LTW.JanyPet.dto.request.BookingCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.BookingUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.BookingResponse;

import java.util.List;


public interface BookingService {
    BookingResponse create(BookingCreationRequest request);

    BookingResponse update(String id, BookingUpdateRequest req);



    BookingResponse getById(String id);

    List<BookingResponse> getAll();


    void delete(String id);
}
