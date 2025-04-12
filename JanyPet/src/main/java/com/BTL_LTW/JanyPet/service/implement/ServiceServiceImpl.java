package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.ServiceCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ServiceUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ServiceResponse;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.mapper.Interface.ServiceMapper;
import com.BTL_LTW.JanyPet.repository.ServiceRepository;
import com.BTL_LTW.JanyPet.service.Interface.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;


import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServiceMapper serviceMapper;

    @Autowired
    public ServiceServiceImpl(ServiceRepository serviceRepository,
                              ServiceMapper serviceMapper) {
        this.serviceRepository = serviceRepository;
        this.serviceMapper = serviceMapper;
    }

    @Override
    public ServiceResponse createService(ServiceCreationRequest request) {
        Service service = serviceMapper.toEntity(request);
        return serviceMapper.toDTO(serviceRepository.save(service));
    }

    @Override
    public ServiceResponse getServicesById(String id) {
        return serviceMapper.toDTO(serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found")));
    }

    @Override
    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(serviceMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public ServiceResponse updateService(String id, ServiceUpdateRequest request) {
        Service existingService = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        serviceMapper.updateEntity(existingService, request);
        return serviceMapper.toDTO(serviceRepository.save(existingService));
    }

    @Override
    public void deleteService(String id) {
        if (!serviceRepository.existsById(id)) {
            throw new RuntimeException("Service not found");
        }
        serviceRepository.deleteById(id);
    }
}