package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.StaffCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.StaffUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.StaffResponse;
import com.BTL_LTW.JanyPet.service.Interface.StaffService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staffs")
public class StaffController {
    
    @Autowired
    private StaffService staffService;
    
    @PostMapping
    public ResponseEntity<StaffResponse> createStaff(@RequestBody StaffCreateRequest request) {
        StaffResponse createdStaff = staffService.createStaff(request);
        return new ResponseEntity<>(createdStaff, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<StaffResponse> updateStaff(
            @PathVariable("id") String id,
            @RequestBody StaffUpdateRequest request) {
        StaffResponse updatedStaff = staffService.updateStaff(id, request);
        return ResponseEntity.ok(updatedStaff);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<StaffResponse> getStaffById(@PathVariable("id") String id) {
        StaffResponse staff = staffService.getStaffById(id);
        return ResponseEntity.ok(staff);
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<StaffResponse> getStaffByEmail(@PathVariable("email") String email) {
        StaffResponse staff = staffService.getStaffByEmail(email);
        return ResponseEntity.ok(staff);
    }
    
    @GetMapping
    public ResponseEntity<List<StaffResponse>> getAllStaff() {
        List<StaffResponse> staffList = staffService.getAllStaff();
        return ResponseEntity.ok(staffList);
    }
    
    @GetMapping("/department/{department}")
    public ResponseEntity<List<StaffResponse>> getStaffByDepartment(
            @PathVariable("department") String department) {
        List<StaffResponse> staffList = staffService.getStaffByDepartment(department);
        return ResponseEntity.ok(staffList);
    }
    
    @GetMapping("/job-title/{jobTitle}")
    public ResponseEntity<List<StaffResponse>> getStaffByJobTitle(
            @PathVariable("jobTitle") String jobTitle) {
        List<StaffResponse> staffList = staffService.getStaffByJobTitle(jobTitle);
        return ResponseEntity.ok(staffList);
    }
    
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<StaffResponse>> getStaffByBranch(
            @PathVariable("branchId") String branchId) {
        List<StaffResponse> staffList = staffService.getStaffByBranch(branchId);
        return ResponseEntity.ok(staffList);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<StaffResponse>> getActiveStaff() {
        List<StaffResponse> staffList = staffService.getActiveStaff();
        return ResponseEntity.ok(staffList);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteStaff(@PathVariable("id") String id) {
        staffService.deleteStaff(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa thành công nhân viên với id: " + id));
    }
}