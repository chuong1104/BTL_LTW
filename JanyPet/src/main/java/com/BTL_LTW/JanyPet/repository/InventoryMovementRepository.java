package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Branch;
import com.BTL_LTW.JanyPet.entity.InventoryMovement;
import com.BTL_LTW.JanyPet.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, String> {
    List<InventoryMovement> findByBranch(Branch branch);
    Page<InventoryMovement> findByBranch(Branch branch, Pageable pageable);
    List<InventoryMovement> findByProduct(Product product);
    List<InventoryMovement> findByBranchAndProduct(Branch branch, Product product);
    List<InventoryMovement> findByMovementDate(LocalDate date);
    List<InventoryMovement> findByMovementDateBetween(LocalDate startDate, LocalDate endDate);
    
    Page<InventoryMovement> findByBranchAndMovementDateBetween(
            Branch branch, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    Page<InventoryMovement> findByMovementType(
            InventoryMovement.MovementType movementType, Pageable pageable);
}