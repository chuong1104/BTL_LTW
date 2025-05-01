package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BranchRepository extends JpaRepository<Branch, String> {
    Branch findByName(String name);
}