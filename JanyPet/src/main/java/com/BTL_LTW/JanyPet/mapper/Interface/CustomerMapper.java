package com.BTL_LTW.JanyPet.mapper;

import com.BTL_LTW.JanyPet.dto.request.CustomerCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.CustomerUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CustomerResponse;
import com.BTL_LTW.JanyPet.dto.response.CustomerSimpleResponse;
import com.BTL_LTW.JanyPet.entity.Customer;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class CustomerMapper {
    
    public Customer toEntity(CustomerCreationRequest request) {
        if (request == null) {
            return null;
        }
        
        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setGender(request.getGender());
        customer.setAge(request.getAge());
        customer.setAddress(request.getAddress());
        customer.setEmail(request.getEmail());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setBirthDate(request.getBirthDate());
        customer.setCity(request.getCity());
        customer.setPostalCode(request.getPostalCode());
        customer.setCustomerType(request.getCustomerType());
        customer.setIsActive(true);
        
        return customer;
    }
    
    public void updateEntity(Customer customer, CustomerUpdateRequest request) {
        if (customer == null || request == null) {
            return;
        }
        
        if (request.getFullName() != null) {
            customer.setFullName(request.getFullName());
        }
        
        if (request.getGender() != null) {
            customer.setGender(request.getGender());
        }
        
        if (request.getAge() != null) {
            customer.setAge(request.getAge());
        }
        
        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress());
        }
        
        if (request.getEmail() != null) {
            customer.setEmail(request.getEmail());
        }
        
        if (request.getPhoneNumber() != null) {
            customer.setPhoneNumber(request.getPhoneNumber());
        }
        
        if (request.getBirthDate() != null) {
            customer.setBirthDate(request.getBirthDate());
        }
        
        if (request.getCity() != null) {
            customer.setCity(request.getCity());
        }
        
        if (request.getPostalCode() != null) {
            customer.setPostalCode(request.getPostalCode());
        }
        
        if (request.getCustomerType() != null) {
            customer.setCustomerType(request.getCustomerType());
        }
        
        if (request.getIsActive() != null) {
            customer.setIsActive(request.getIsActive());
        }
    }
    
    public CustomerResponse toDTO(Customer customer) {
        if (customer == null) {
            return null;
        }
        
        CustomerResponse dto = new CustomerResponse();
        dto.setId(customer.getId());
        dto.setFullName(customer.getFullName());
        dto.setGender(customer.getGender());
        dto.setAge(customer.getAge());
        dto.setAddress(customer.getAddress());
        dto.setEmail(customer.getEmail());
        dto.setPhoneNumber(customer.getPhoneNumber());
        dto.setIsActive(customer.getIsActive());
        dto.setBirthDate(customer.getBirthDate());
        dto.setCity(customer.getCity());
        dto.setPostalCode(customer.getPostalCode());
        dto.setCustomerType(customer.getCustomerType());
        dto.setCreatedAt(customer.getCreatedAt());
        dto.setUpdatedAt(customer.getUpdatedAt());
        
        return dto;
    }
    
    public CustomerResponse toDTOWithStats(Customer customer, Integer orderCount, 
                                         Integer bookingCount, BigDecimal totalSpent) {
        CustomerResponse dto = toDTO(customer);
        if (dto != null) {
            dto.setOrderCount(orderCount);
            dto.setBookingCount(bookingCount);
            dto.setTotalSpent(totalSpent != null ? totalSpent : BigDecimal.ZERO);
        }
        return dto;
    }
    
    public CustomerSimpleResponse toSimpleDTO(Customer customer) {
        if (customer == null) {
            return null;
        }
        
        return new CustomerSimpleResponse(
            customer.getId(),
            customer.getFullName(),
            customer.getEmail(),
            customer.getPhoneNumber(),
            customer.getCustomerType(),
            customer.getIsActive()
        );
    }
}