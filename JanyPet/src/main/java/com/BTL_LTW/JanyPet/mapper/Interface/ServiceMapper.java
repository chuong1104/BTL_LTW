package com.BTL_LTW.JanyPet.mapper.Interface;

import com.BTL_LTW.JanyPet.dto.request.ServiceCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ServiceUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ServiceResponse;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.mapper.GenericMapper;

import java.util.List;

public interface ServiceMapper extends GenericMapper<Service, ServiceResponse, ServiceCreationRequest, ServiceUpdateRequest> {
    // Additional methods specific to Service mapping
    List<ServiceResponse> toDTOList(List<Service> entities);
}
