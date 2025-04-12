package com.BTL_LTW.JanyPet.mapper.Interface;

import com.BTL_LTW.JanyPet.dto.request.CuponCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.CuponUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CuponResponse;
import com.BTL_LTW.JanyPet.entity.Cupon;
import com.BTL_LTW.JanyPet.mapper.GenericMapper;

public interface CuponMapper extends GenericMapper<Cupon, CuponResponse, CuponCreateRequest, CuponUpdateRequest> {
}
