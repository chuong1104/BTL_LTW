package com.BTL_LTW.JanyPet.controller;

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

    // Tạo dịch vụ mới
    @PostMapping
    public ResponseEntity<ServiceResponse> createService(
            @RequestBody ServiceCreationRequest request
    ) {
        ServiceResponse resp = serviceService.createService(request);
        return ResponseEntity.ok(resp);
    }

    // Lấy tất cả dịch vụ
    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAllServices() {
        List<ServiceResponse> list = serviceService.getAllServices();
        return ResponseEntity.ok(list);
    }

    // Lấy dịch vụ theo id
    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getServiceById(
            @PathVariable("id") String id
    ) {
        ServiceResponse resp = serviceService.getServicesById(id);
        return ResponseEntity.ok(resp);
    }

    // Cập nhật dịch vụ
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponse> updateService(
            @PathVariable("id") String id,
            @RequestBody ServiceUpdateRequest request
    ) {
        ServiceResponse resp = serviceService.updateService(id, request);
        return ResponseEntity.ok(resp);
    }

    // Xóa dịch vụ
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable("id") String id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
