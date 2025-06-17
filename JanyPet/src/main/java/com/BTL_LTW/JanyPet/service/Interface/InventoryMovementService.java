package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.InventoryMovementRequest;
import com.BTL_LTW.JanyPet.dto.response.InventoryMovementResponse;
import com.BTL_LTW.JanyPet.entity.InventoryMovement;

import java.time.LocalDate;
import java.util.List;

public interface InventoryMovementService {

    // Basic CRUD operations
    InventoryMovementResponse createMovement(InventoryMovementRequest request);

    InventoryMovementResponse updateMovement(String id, InventoryMovementRequest request);

    InventoryMovementResponse getMovementById(String id);

    List<InventoryMovementResponse> getAllMovements();

    void deleteMovement(String id);

    // Filter operations
    List<InventoryMovementResponse> getMovementsByBranch(String branchId);

    List<InventoryMovementResponse> getMovementsByProduct(String productId);

    List<InventoryMovementResponse> getMovementsByType(InventoryMovement.MovementType movementType);

    List<InventoryMovementResponse> getMovementsByDateRange(LocalDate startDate, LocalDate endDate);

    List<InventoryMovementResponse> getMovementsByBranchAndDateRange(String branchId, LocalDate startDate,
            LocalDate endDate); // Stock operations

    Integer getCurrentStock(String productId, String branchId);

    Integer getTotalStock(String productId);

    boolean isStockSufficient(String productId, String branchId, Integer quantity);
}
