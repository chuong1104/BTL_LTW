package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.CustomerCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.CustomerUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CustomerResponse;
import com.BTL_LTW.JanyPet.dto.response.CustomerSimpleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CustomerService {
    
    CustomerResponse createCustomer(CustomerCreationRequest request);
    
    CustomerResponse updateCustomer(String id, CustomerUpdateRequest request);
    
    CustomerResponse getCustomerById(String id);
    
    Page<CustomerResponse> getAllCustomers(Pageable pageable);
    
    Page<CustomerResponse> getCustomersWithFilters(
            String customerType, Boolean isActive, String search, Pageable pageable);
    
    void deleteCustomer(String id);
    
    boolean toggleCustomerStatus(String id);
    
    List<CustomerSimpleResponse> getActiveCustomers();
    
    Page<CustomerResponse> searchCustomers(String query, Pageable pageable);
}