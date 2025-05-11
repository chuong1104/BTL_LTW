package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.common.ServiceCategory;
import com.BTL_LTW.JanyPet.dto.request.ServiceCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ServiceUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ServiceResponse;

import java.util.List;

public interface ServiceService {
    ServiceResponse createService(ServiceCreationRequest request);
    
    ServiceResponse getServiceById(String id);
    
    List<ServiceResponse> getAllServices();
    
    List<ServiceResponse> getServicesByCategory(ServiceCategory category);
    
    List<ServiceResponse> getFeaturedServices();
    
    List<ServiceResponse> getPopularServices();
    
    List<ServiceResponse> getServicePackages();
    
    List<ServiceResponse> searchServices(String keyword);
    
    ServiceResponse updateService(String id, ServiceUpdateRequest request);
    
    void deleteService(String id);
}



