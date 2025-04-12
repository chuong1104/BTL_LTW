package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.CuponCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.CuponUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CuponResponse;

import java.util.List;

public interface CuponService {
    CuponResponse createCupon(CuponCreateRequest request);
    CuponResponse updateCupon(String id, CuponUpdateRequest request);
    CuponResponse getCuponById(String id);
    List<CuponResponse> getAllCupons();
    void deleteCupon(String id);
}
