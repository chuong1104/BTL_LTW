package com.BTL_LTW.JanyPet.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.BTL_LTW.JanyPet.dto.request.InventoryMovementRequest;
import com.BTL_LTW.JanyPet.dto.response.InventoryMovementResponse;
import com.BTL_LTW.JanyPet.dto.response.InventoryResponse;
import com.BTL_LTW.JanyPet.service.Interface.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private static final Logger log = LoggerFactory.getLogger(InventoryController.class);

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventory() {
        List<InventoryResponse> inventory = inventoryService.getAllInventory();
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<InventoryResponse>> getInventoryByBranch(@PathVariable String branchId) {
        List<InventoryResponse> inventory = inventoryService.getInventoryByBranch(branchId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<InventoryResponse>> getInventoryByProduct(@PathVariable String productId) {
        List<InventoryResponse> inventory = inventoryService.getInventoryByProduct(productId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/branch/{branchId}/product/{productId}")
    public ResponseEntity<InventoryResponse> getInventoryByBranchAndProduct(
            @PathVariable String branchId,
            @PathVariable String productId) {
        InventoryResponse inventory = inventoryService.getInventoryByBranchAndProduct(branchId, productId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStockInventory(
            @RequestParam(required = false) String branchId) {
        List<InventoryResponse> inventory = inventoryService.getLowStockInventory(branchId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<InventoryResponse>> getOutOfStockInventory(
            @RequestParam(required = false) String branchId) {
        List<InventoryResponse> inventory = inventoryService.getOutOfStockInventory(branchId);
        return ResponseEntity.ok(inventory);
    }

    @PostMapping("/movement/import")
    public ResponseEntity<InventoryMovementResponse> importInventory(@RequestBody InventoryMovementRequest request) {
        InventoryMovementResponse movement = inventoryService.importInventory(request);
        return new ResponseEntity<>(movement, HttpStatus.CREATED);
    }

    @PostMapping("/movement/export")
    public ResponseEntity<InventoryMovementResponse> exportInventory(@RequestBody InventoryMovementRequest request) {
        try {
            log.info("Received export request: {}", request);
            InventoryMovementResponse response = inventoryService.exportInventory(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing export request: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/movement/adjust")
    public ResponseEntity<InventoryMovementResponse> adjustInventory(@RequestBody InventoryMovementRequest request) {
        InventoryMovementResponse movement = inventoryService.adjustInventory(request);
        return new ResponseEntity<>(movement, HttpStatus.CREATED);
    }

    @GetMapping("/movements")
    public ResponseEntity<List<InventoryMovementResponse>> getInventoryMovements(
            @RequestParam(required = false) String branchId,
            @RequestParam(required = false) String productId,
            @RequestParam(required = false) String movementType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        List<InventoryMovementResponse> movements = inventoryService.getInventoryMovements(
                branchId, productId, movementType, fromDate, toDate, page, size);
        
        return ResponseEntity.ok(movements);
    }
}