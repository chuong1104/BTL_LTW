package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.common.ServiceCategory;
import com.BTL_LTW.JanyPet.dto.request.ServiceCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ServiceUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ServiceResponse;
import com.BTL_LTW.JanyPet.service.Interface.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceService serviceService;

    @Autowired
    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    // Create a new service
    @PostMapping
    public ResponseEntity<ServiceResponse> createService(
            @RequestBody ServiceCreationRequest request
    ) {
        ServiceResponse response = serviceService.createService(request);
        return ResponseEntity.ok(response);
    }

    // Get all services
    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAllServices() {
        List<ServiceResponse> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }

    // Get service by ID (for modal details)
    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getServiceById(
            @PathVariable("id") String id
    ) {
        ServiceResponse service = serviceService.getServiceById(id);
        return ResponseEntity.ok(service);
    }
    
    // Get services by category (for tabs)
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ServiceResponse>> getServicesByCategory(
            @PathVariable("category") ServiceCategory category
    ) {
        List<ServiceResponse> services = serviceService.getServicesByCategory(category);
        return ResponseEntity.ok(services);
    }
    
    // Get featured services
    @GetMapping("/featured")
    public ResponseEntity<List<ServiceResponse>> getFeaturedServices() {
        List<ServiceResponse> services = serviceService.getFeaturedServices();
        return ResponseEntity.ok(services);
    }
    
    // Get popular services
    @GetMapping("/popular")
    public ResponseEntity<List<ServiceResponse>> getPopularServices() {
        List<ServiceResponse> services = serviceService.getPopularServices();
        return ResponseEntity.ok(services);
    }
    
    // Get service packages/combos
    @GetMapping("/packages")
    public ResponseEntity<List<ServiceResponse>> getServicePackages() {
        List<ServiceResponse> packages = serviceService.getServicePackages();
        return ResponseEntity.ok(packages);
    }
    
    // Search services by keyword
    @GetMapping("/search")
    public ResponseEntity<List<ServiceResponse>> searchServices(
            @RequestParam("keyword") String keyword
    ) {
        List<ServiceResponse> services = serviceService.searchServices(keyword);
        return ResponseEntity.ok(services);
    }

    // Update a service
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponse> updateService(
            @PathVariable("id") String id,
            @RequestBody ServiceUpdateRequest request
    ) {
        ServiceResponse service = serviceService.updateService(id, request);
        return ResponseEntity.ok(service);
    }

    // Delete a service
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable("id") String id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
