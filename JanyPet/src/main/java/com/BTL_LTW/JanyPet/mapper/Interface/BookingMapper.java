package com.BTL_LTW.JanyPet.mapper.Interface;

import com.BTL_LTW.JanyPet.dto.request.BookingCreationRequest;

import com.BTL_LTW.JanyPet.dto.request.BookingUpdateRequest;

import com.BTL_LTW.JanyPet.dto.response.BookingResponse;
import com.BTL_LTW.JanyPet.entity.Booking;
import com.BTL_LTW.JanyPet.mapper.GenericMapper;


import java.util.List;

public interface BookingMapper extends GenericMapper<Booking, BookingResponse, BookingCreationRequest, BookingUpdateRequest> {
    // Additional methods specific to Booking mapping
    List<BookingResponse> toDTOList(List<Booking> entities);

    //void updateEntityFromRequest(BookingResponse bookingRequest, Booking existing);
}
