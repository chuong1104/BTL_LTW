package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.StaffCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.StaffUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.StaffResponse;

import java.util.List;

public interface StaffService {
    StaffResponse createStaff(StaffCreateRequest request);
    
    StaffResponse updateStaff(String id, StaffUpdateRequest request);
    
    StaffResponse getStaffById(String id);
    
    StaffResponse getStaffByEmail(String email);
    
    List<StaffResponse> getAllStaff();
    
    List<StaffResponse> getStaffByDepartment(String department);
    
    List<StaffResponse> getStaffByJobTitle(String jobTitle);
    
    List<StaffResponse> getStaffByBranch(String branchId);
    
    List<StaffResponse> getActiveStaff();
    
    void deleteStaff(String id);
}