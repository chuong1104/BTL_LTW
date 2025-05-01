package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, String> {
    Optional<Staff> findByEmail(String email);
    List<Staff> findByDepartment(String department);
    List<Staff> findByJobTitle(String jobTitle);
    List<Staff> findByBranchId(String branchId);
    List<Staff> findByActive(boolean active);
    
    boolean existsByEmail(String email);
}