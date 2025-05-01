package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.response.InventoryResponse;
import com.BTL_LTW.JanyPet.dto.request.InventoryMovementRequest;
import com.BTL_LTW.JanyPet.dto.response.InventoryMovementResponse;

import java.time.LocalDate;
import java.util.List;

public interface InventoryService {
    // Get inventory methods
    List<InventoryResponse> getAllInventory();
    List<InventoryResponse> getInventoryByBranch(String branchId);
    List<InventoryResponse> getInventoryByProduct(String productId);
    InventoryResponse getInventoryByBranchAndProduct(String branchId, String productId);
    List<InventoryResponse> getLowStockInventory(String branchId);
    List<InventoryResponse> getOutOfStockInventory(String branchId);
    
    // Inventory movement methods
    InventoryMovementResponse importInventory(InventoryMovementRequest request);
    InventoryMovementResponse exportInventory(InventoryMovementRequest request);
    InventoryMovementResponse adjustInventory(InventoryMovementRequest request);
    
    // Inventory history methods
    List<InventoryMovementResponse> getInventoryMovements(String branchId, String productId, 
                                                          String movementType, LocalDate fromDate, 
                                                          LocalDate toDate, int page, int size);

    Integer calculateTotalStock(String productId);
}