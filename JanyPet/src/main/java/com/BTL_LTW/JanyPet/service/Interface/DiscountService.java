package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.DiscountCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.DiscountUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.DiscountResponse;

import java.util.List;

public interface DiscountService {
    DiscountResponse createDiscount(DiscountCreateRequest request);
    DiscountResponse updateDiscount(String id, DiscountUpdateRequest request);
    DiscountResponse getDiscountById(String id);
    List<DiscountResponse> getAllDiscounts();
    void deleteDiscount(String id);
}
