package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.InventoryMovementRequest;
import com.BTL_LTW.JanyPet.dto.response.InventoryMovementResponse;
import com.BTL_LTW.JanyPet.entity.InventoryMovement;
import com.BTL_LTW.JanyPet.service.Interface.InventoryMovementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory-movements")
public class InventoryMovementController {

    @Autowired
    private InventoryMovementService inventoryMovementService; // Get all movements

    @GetMapping
    public ResponseEntity<List<InventoryMovementResponse>> getAllMovements() {
        try {
            System.out.println("Getting all inventory movements...");
            List<InventoryMovementResponse> movements = inventoryMovementService.getAllMovements();
            System.out.println("Found " + movements.size() + " movements");
            return ResponseEntity.ok(movements);
        } catch (Exception e) {
            System.err.println("Error getting movements: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    } // Get movement by ID

    @GetMapping("/{id}")
    public ResponseEntity<InventoryMovementResponse> getMovementById(@PathVariable String id) {
        try {
            InventoryMovementResponse movement = inventoryMovementService.getMovementById(id);
            return ResponseEntity.ok(movement);
        } catch (Exception e) {
            System.err.println("Error getting movement by id: " + e.getMessage());
            return ResponseEntity.status(404).build();
        }
    } // Create new movement

    @PostMapping
    public ResponseEntity<InventoryMovementResponse> createMovement(
            @Valid @RequestBody InventoryMovementRequest request) {
        try {
            System.out.println(
                    "Creating movement: " + request.getMovementType() + " for product " + request.getProductId());
            InventoryMovementResponse createdMovement = inventoryMovementService.createMovement(request);
            return new ResponseEntity<>(createdMovement, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error creating movement: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).build();
        }
    } // Update movement

    @PutMapping("/{id}")
    public ResponseEntity<InventoryMovementResponse> updateMovement(
            @PathVariable String id,
            @Valid @RequestBody InventoryMovementRequest request) {
        try {
            InventoryMovementResponse updatedMovement = inventoryMovementService.updateMovement(id, request);
            return ResponseEntity.ok(updatedMovement);
        } catch (Exception e) {
            System.err.println("Error updating movement: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    } // Delete movement

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteMovement(@PathVariable String id) {
        try {
            inventoryMovementService.deleteMovement(id);
            return ResponseEntity.ok(Map.of("message", "Movement deleted successfully"));
        } catch (Exception e) {
            System.err.println("Error deleting movement: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    } // Get movements by branch

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<InventoryMovementResponse>> getMovementsByBranch(@PathVariable String branchId) {
        try {
            List<InventoryMovementResponse> movements = inventoryMovementService.getMovementsByBranch(branchId);
            return ResponseEntity.ok(movements);
        } catch (Exception e) {
            System.err.println("Error getting movements by branch: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    } // Get movements by product

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<InventoryMovementResponse>> getMovementsByProduct(@PathVariable String productId) {
        try {
            List<InventoryMovementResponse> movements = inventoryMovementService.getMovementsByProduct(productId);
            return ResponseEntity.ok(movements);
        } catch (Exception e) {
            System.err.println("Error getting movements by product: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    } // Get movements by type

    @GetMapping("/type/{movementType}")
    public ResponseEntity<List<InventoryMovementResponse>> getMovementsByType(
            @PathVariable InventoryMovement.MovementType movementType) {
        try {
            List<InventoryMovementResponse> movements = inventoryMovementService.getMovementsByType(movementType);
            return ResponseEntity.ok(movements);
        } catch (Exception e) {
            System.err.println("Error getting movements by type: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    } // Get movements by date range

    @GetMapping("/date-range")
    public ResponseEntity<List<InventoryMovementResponse>> getMovementsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<InventoryMovementResponse> movements = inventoryMovementService.getMovementsByDateRange(startDate,
                    endDate);
            return ResponseEntity.ok(movements);
        } catch (Exception e) {
            System.err.println("Error getting movements by date range: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    }

    // Get current stock for a product at a branch
    @GetMapping("/stock/{productId}/{branchId}")
    public ResponseEntity<Map<String, Integer>> getCurrentStock(
            @PathVariable String productId,
            @PathVariable String branchId) {
        try {
            Integer currentStock = inventoryMovementService.getCurrentStock(productId, branchId);
            return ResponseEntity.ok(Map.of("quantity", currentStock));
        } catch (Exception e) {
            System.err.println("Error getting current stock: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    }

    // Get total stock for a product across all branches
    @GetMapping("/total-stock/{productId}")
    public ResponseEntity<Map<String, Integer>> getTotalStock(@PathVariable String productId) {
        try {
            Integer totalStock = inventoryMovementService.getTotalStock(productId);
            return ResponseEntity.ok(Map.of("totalQuantity", totalStock));
        } catch (Exception e) {
            System.err.println("Error getting total stock: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    }

    // Check if stock is sufficient
    @GetMapping("/stock-check/{productId}/{branchId}/{quantity}")
    public ResponseEntity<Map<String, Boolean>> checkStockSufficiency(
            @PathVariable String productId,
            @PathVariable String branchId,
            @PathVariable Integer quantity) {
        try {
            boolean isSufficient = inventoryMovementService.isStockSufficient(productId, branchId, quantity);
            return ResponseEntity.ok(Map.of("sufficient", isSufficient));
        } catch (Exception e) {
            System.err.println("Error checking stock sufficiency: " + e.getMessage());
            return ResponseEntity.status(400).build();
        }
    }

    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Inventory Movement API is working!");
    }
}
