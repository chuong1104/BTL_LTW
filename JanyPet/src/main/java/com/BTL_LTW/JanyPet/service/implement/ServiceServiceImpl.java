package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.common.ServiceCategory;
import com.BTL_LTW.JanyPet.dto.request.ServiceCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ServiceUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ServiceItemResponse;
import com.BTL_LTW.JanyPet.dto.response.ServiceResponse;
import com.BTL_LTW.JanyPet.entity.Service;
import com.BTL_LTW.JanyPet.entity.ServiceItem;
import com.BTL_LTW.JanyPet.mapper.Interface.ServiceItemMapper;
import com.BTL_LTW.JanyPet.mapper.Interface.ServiceMapper;
import com.BTL_LTW.JanyPet.repository.ServiceItemRepository;
import com.BTL_LTW.JanyPet.repository.ServiceRepository;
import com.BTL_LTW.JanyPet.service.Interface.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServiceItemRepository serviceItemRepository;
    private final ServiceMapper serviceMapper;
    private final ServiceItemMapper serviceItemMapper;

    @Autowired
    public ServiceServiceImpl(ServiceRepository serviceRepository,
                              ServiceItemRepository serviceItemRepository,
                              ServiceMapper serviceMapper,
                              ServiceItemMapper serviceItemMapper) {
        this.serviceRepository = serviceRepository;
        this.serviceItemRepository = serviceItemRepository;
        this.serviceMapper = serviceMapper;
        this.serviceItemMapper = serviceItemMapper;
    }

    @Override
    @Transactional
    public ServiceResponse createService(ServiceCreationRequest request) {
        // Create service entity
        Service service = serviceMapper.toEntity(request);
        Service savedService = serviceRepository.save(service);
        
        // Handle service items if any
        if (request.getServiceItems() != null && !request.getServiceItems().isEmpty()) {
            List<ServiceItem> serviceItems = serviceItemMapper.toEntityList(request.getServiceItems(), savedService);
            List<ServiceItem> savedItems = serviceItemRepository.saveAll(serviceItems);
            List<ServiceItemResponse> itemResponses = serviceItemMapper.toDTOList(savedItems);
            
            return serviceMapper.toDTOWithItems(savedService, itemResponses);
        }
        
        return serviceMapper.toDTO(savedService);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(String id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
        
        // Fetch service items
        List<ServiceItem> serviceItems = serviceItemRepository.findByServiceId(id);
        List<ServiceItemResponse> itemResponses = serviceItemMapper.toDTOList(serviceItems);
        
        return serviceMapper.toDTOWithItems(service, itemResponses);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllServices() {
        List<Service> services = serviceRepository.findAll();
        return serviceMapper.toDTOList(services);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getServicesByCategory(ServiceCategory category) {
        List<Service> services = serviceRepository.findByCategory(category);
        return serviceMapper.toDTOList(services);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getFeaturedServices() {
        List<Service> services = serviceRepository.findByIsFeaturedTrue();
        return serviceMapper.toDTOList(services);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getPopularServices() {
        List<Service> services = serviceRepository.findByIsPopularTrue();
        return serviceMapper.toDTOList(services);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getServicePackages() {
        List<Service> services = serviceRepository.findAllPackages();
        return serviceMapper.toDTOList(services);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> searchServices(String keyword) {
        List<Service> services = serviceRepository.searchServicesByKeyword(keyword);
        return serviceMapper.toDTOList(services);
    }

    @Override
    @Transactional
    public ServiceResponse updateService(String id, ServiceUpdateRequest request) {
        Service existingService = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
        
        serviceMapper.updateEntity(existingService, request);
        Service updatedService = serviceRepository.save(existingService);
        
        // Fetch service items
        List<ServiceItem> serviceItems = serviceItemRepository.findByServiceId(id);
        List<ServiceItemResponse> itemResponses = serviceItemMapper.toDTOList(serviceItems);
        
        return serviceMapper.toDTOWithItems(updatedService, itemResponses);
    }

    @Override
    @Transactional
    public void deleteService(String id) {
        // Delete associated service items first
        serviceItemRepository.deleteByServiceId(id);
        
        // Then delete the service
        serviceRepository.deleteById(id);
    }
}