package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.StaffCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.StaffUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.StaffResponse;
import com.BTL_LTW.JanyPet.entity.Staff;
import com.BTL_LTW.JanyPet.repository.StaffRepository;
import com.BTL_LTW.JanyPet.service.Interface.StaffService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StaffServiceImpl implements StaffService {

    @Autowired
    private StaffRepository staffRepository;

    @Override
    public StaffResponse createStaff(StaffCreateRequest request) {
        // Check if email already exists
        if (staffRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống");
        }
        
        // Create new staff
        Staff staff = new Staff();
        staff.setFullName(request.getFullName());
        staff.setEmail(request.getEmail());
        staff.setPhoneNumber(request.getPhoneNumber());
        staff.setDepartment(request.getDepartment());
        staff.setJobTitle(request.getJobTitle());
        staff.setBranchId(request.getBranchId());
        staff.setBranchName(request.getBranchName());
        staff.setActive(request.isActive());
        
        // Save to database
        Staff savedStaff = staffRepository.save(staff);
        
        // Convert to response
        return mapToResponse(savedStaff);
    }

    @Override
    public StaffResponse updateStaff(String id, StaffUpdateRequest request) {
        // Find staff
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với id: " + id));
        
        // Check email uniqueness only if email is being changed
        if (request.getEmail() != null && !request.getEmail().equals(staff.getEmail())) {
            if (staffRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email đã tồn tại trong hệ thống");
            }
            staff.setEmail(request.getEmail());
        }
        
        // Update fields if provided
        if (request.getFullName() != null) {
            staff.setFullName(request.getFullName());
        }
        
        if (request.getPhoneNumber() != null) {
            staff.setPhoneNumber(request.getPhoneNumber());
        }
        
        if (request.getDepartment() != null) {
            staff.setDepartment(request.getDepartment());
        }
        
        if (request.getJobTitle() != null) {
            staff.setJobTitle(request.getJobTitle());
        }
        
        if (request.getBranchId() != null) {
            staff.setBranchId(request.getBranchId());
        }
        
        if (request.getBranchName() != null) {
            staff.setBranchName(request.getBranchName());
        }
        
        if (request.getActive() != null) {
            staff.setActive(request.getActive());
        }
        
        // Save updates
        Staff updatedStaff = staffRepository.save(staff);
        
        // Convert to response
        return mapToResponse(updatedStaff);
    }

    @Override
    public StaffResponse getStaffById(String id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với id: " + id));
        
        return mapToResponse(staff);
    }

    @Override
    public StaffResponse getStaffByEmail(String email) {
        Staff staff = staffRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với email: " + email));
        
        return mapToResponse(staff);
    }

    @Override
    public List<StaffResponse> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffResponse> getStaffByDepartment(String department) {
        return staffRepository.findByDepartment(department).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffResponse> getStaffByJobTitle(String jobTitle) {
        return staffRepository.findByJobTitle(jobTitle).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffResponse> getStaffByBranch(String branchId) {
        return staffRepository.findByBranchId(branchId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StaffResponse> getActiveStaff() {
        return staffRepository.findByActive(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteStaff(String id) {
        if (!staffRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy nhân viên với id: " + id);
        }
        
        staffRepository.deleteById(id);
    }
    
    /**
     * Map Staff entity to StaffResponse DTO
     */
    private StaffResponse mapToResponse(Staff staff) {
        StaffResponse response = new StaffResponse();
        response.setId(staff.getId());
        response.setFullName(staff.getFullName());
        response.setEmail(staff.getEmail());
        response.setPhoneNumber(staff.getPhoneNumber());
        response.setDepartment(staff.getDepartment());
        response.setJobTitle(staff.getJobTitle());
        response.setBranchId(staff.getBranchId());
        response.setBranchName(staff.getBranchName());
        response.setActive(staff.isActive());
        response.setCreatedAt(staff.getCreatedAt());
        response.setUpdatedAt(staff.getUpdatedAt());
        return response;
    }
}