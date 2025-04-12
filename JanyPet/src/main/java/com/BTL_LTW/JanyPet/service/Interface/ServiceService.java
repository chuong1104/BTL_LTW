package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.ServiceCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ServiceUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ServiceResponse;

import java.util.List;

public interface ServiceService {
    ServiceResponse createService(ServiceCreationRequest request);

    //ServiceResponse getServiceById(String id);

   // ServiceResponse getServiceById(String id);

    //ServiceResponse getServicesById(String id);

    ServiceResponse getServicesById(String id);

    List<ServiceResponse> getAllServices();

    //ServiceResponse updateService(String id, ServiceUpdateRequest request);
    //void deleteService(String id);

    ServiceResponse updateService(String id, ServiceUpdateRequest request);

    void deleteService(String id);

    //ServiceResponse getServicesById(List<Long> serviceIds);
}



