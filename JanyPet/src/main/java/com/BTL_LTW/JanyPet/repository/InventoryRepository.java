package com.BTL_LTW.JanyPet.repository;

import com.BTL_LTW.JanyPet.entity.Branch;
import com.BTL_LTW.JanyPet.entity.Inventory;
import com.BTL_LTW.JanyPet.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {
    List<Inventory> findByBranch(Branch branch);
    List<Inventory> findByProduct(Product product);
    Optional<Inventory> findByBranchAndProduct(Branch branch, Product product);
    List<Inventory> findByQuantityLessThanEqual(Integer quantity);
    List<Inventory> findByQuantityEquals(Integer quantity);
    List<Inventory> findByBranchAndQuantityLessThanEqual(Branch branch, Integer quantity);
}