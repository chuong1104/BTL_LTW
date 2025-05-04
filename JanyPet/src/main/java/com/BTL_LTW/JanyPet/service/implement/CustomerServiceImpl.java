package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.CustomerCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.CustomerUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CustomerResponse;
import com.BTL_LTW.JanyPet.dto.response.CustomerSimpleResponse;
import com.BTL_LTW.JanyPet.entity.Customer;
import com.BTL_LTW.JanyPet.mapper.CustomerMapper;
import com.BTL_LTW.JanyPet.repository.CustomerRepository;
import com.BTL_LTW.JanyPet.service.Interface.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Autowired
    public CustomerServiceImpl(CustomerRepository customerRepository, CustomerMapper customerMapper) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }

    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerCreationRequest request) {
        // Check if email already exists
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        
        // Check if phone number already exists
        if (customerRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }
        
        Customer customer = customerMapper.toEntity(request);
        Customer savedCustomer = customerRepository.save(customer);
        return customerMapper.toDTO(savedCustomer);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(String id, CustomerUpdateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        // Check if email already exists and is different from current customer's email
        if (request.getEmail() != null && !request.getEmail().equals(customer.getEmail()) 
                && customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        
        // Check if phone number already exists and is different from current customer's phone number
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(customer.getPhoneNumber())
                && customerRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }
        
        customerMapper.updateEntity(customer, request);
        Customer updatedCustomer = customerRepository.save(customer);
        return customerMapper.toDTO(updatedCustomer);
    }

    @Override
    public CustomerResponse getCustomerById(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        return customerMapper.toDTO(customer);
    }

    @Override
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable)
                .map(customerMapper::toDTO);
    }

    @Override
    public Page<CustomerResponse> getCustomersWithFilters(
            String customerType, Boolean isActive, String search, Pageable pageable) {
        return customerRepository.findWithFilters(customerType, isActive, search, pageable)
                .map(customerMapper::toDTO);
    }

    @Override
    @Transactional
    public void deleteCustomer(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        customerRepository.delete(customer);
    }

    @Override
    @Transactional
    public boolean toggleCustomerStatus(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        customer.setIsActive(!customer.getIsActive());
        customerRepository.save(customer);
        
        return customer.getIsActive();
    }

    @Override
    public List<CustomerSimpleResponse> getActiveCustomers() {
        return customerRepository.findByIsActiveTrue().stream()
                .map(customerMapper::toSimpleDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<CustomerResponse> searchCustomers(String query, Pageable pageable) {
        return customerRepository.search(query, pageable)
                .map(customerMapper::toDTO);
    }
}