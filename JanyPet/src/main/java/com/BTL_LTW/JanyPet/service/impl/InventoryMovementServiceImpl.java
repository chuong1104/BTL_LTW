package com.BTL_LTW.JanyPet.service.impl;

import com.BTL_LTW.JanyPet.dto.request.InventoryMovementRequest;
import com.BTL_LTW.JanyPet.dto.response.InventoryMovementResponse;
import com.BTL_LTW.JanyPet.entity.Branch;
import com.BTL_LTW.JanyPet.entity.InventoryMovement;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.repository.BranchRepository;
import com.BTL_LTW.JanyPet.repository.InventoryMovementRepository;
import com.BTL_LTW.JanyPet.repository.InventoryRepository;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.service.Interface.InventoryMovementService;
import com.BTL_LTW.JanyPet.service.Interface.InventoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryMovementServiceImpl implements InventoryMovementService {

    @Autowired
    private InventoryMovementRepository inventoryMovementRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Override
    public InventoryMovementResponse createMovement(InventoryMovementRequest request) {
        // Validate branch and product
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + request.getBranchId()));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

        // For EXPORT movement, check if there's enough stock
        if (request.getMovementType() == InventoryMovement.MovementType.EXPORT) {
            Integer currentStock = getCurrentStock(request.getProductId(), request.getBranchId());
            if (currentStock < request.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock. Current: " + currentStock + ", Requested: " + request.getQuantity());
            }
        }

        // Calculate balance quantity after this movement
        Integer currentStock = getCurrentStock(request.getProductId(), request.getBranchId());
        Integer balanceQuantity;

        switch (request.getMovementType()) {
            case IMPORT:
                balanceQuantity = currentStock + request.getQuantity();
                break;
            case EXPORT:
                balanceQuantity = currentStock - request.getQuantity();
                break;
            default:
                balanceQuantity = currentStock;
                break;
        }

        // Create movement entity
        InventoryMovement movement = new InventoryMovement();
        movement.setBranch(branch);
        movement.setProduct(product);
        movement.setMovementType(request.getMovementType());
        movement.setQuantity(request.getQuantity());
        movement.setBalanceQuantity(balanceQuantity);
        movement.setMovementDate(request.getMovementDate());
        movement.setNotes(request.getNotes());

        // Save movement
        InventoryMovement savedMovement = inventoryMovementRepository.save(movement);

        // Update inventory stock
        updateInventoryStock(request.getProductId(), request.getBranchId(), balanceQuantity);

        return convertToResponse(savedMovement);
    }

    @Override
    public InventoryMovementResponse updateMovement(String id, InventoryMovementRequest request) {
        InventoryMovement existingMovement = inventoryMovementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movement not found with id: " + id));

        // Validate branch and product
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + request.getBranchId()));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

        // Recalculate stock considering the update
        Integer currentStock = getCurrentStock(request.getProductId(), request.getBranchId());

        // Reverse the effect of the existing movement
        switch (existingMovement.getMovementType()) {
            case IMPORT:
                currentStock -= existingMovement.getQuantity();
                break;
            case EXPORT:
                currentStock += existingMovement.getQuantity();
                break;
        }

        // Apply the new movement
        Integer balanceQuantity;
        switch (request.getMovementType()) {
            case IMPORT:
                balanceQuantity = currentStock + request.getQuantity();
                break;
            case EXPORT:
                if (currentStock < request.getQuantity()) {
                    throw new RuntimeException("Insufficient stock after update. Current: " + currentStock
                            + ", Requested: " + request.getQuantity());
                }
                balanceQuantity = currentStock - request.getQuantity();
                break;
            default:
                balanceQuantity = currentStock;
                break;
        }

        // Update movement
        existingMovement.setBranch(branch);
        existingMovement.setProduct(product);
        existingMovement.setMovementType(request.getMovementType());
        existingMovement.setQuantity(request.getQuantity());
        existingMovement.setBalanceQuantity(balanceQuantity);
        existingMovement.setMovementDate(request.getMovementDate());
        existingMovement.setNotes(request.getNotes());

        InventoryMovement updatedMovement = inventoryMovementRepository.save(existingMovement);

        // Update inventory stock
        updateInventoryStock(request.getProductId(), request.getBranchId(), balanceQuantity);

        return convertToResponse(updatedMovement);
    }

    @Override
    public InventoryMovementResponse getMovementById(String id) {
        InventoryMovement movement = inventoryMovementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movement not found with id: " + id));
        return convertToResponse(movement);
    }

    @Override
    public List<InventoryMovementResponse> getAllMovements() {
        List<InventoryMovement> movements = inventoryMovementRepository.findAll();
        return movements.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteMovement(String id) {
        InventoryMovement movement = inventoryMovementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movement not found with id: " + id));

        // Reverse the stock effect before deleting
        Integer currentStock = getCurrentStock(movement.getProduct().getId(), movement.getBranch().getId());
        Integer newStock;

        switch (movement.getMovementType()) {
            case IMPORT:
                newStock = currentStock - movement.getQuantity();
                break;
            case EXPORT:
                newStock = currentStock + movement.getQuantity();
                break;
            default:
                newStock = currentStock;
                break;
        }

        // Update inventory stock
        updateInventoryStock(movement.getProduct().getId(), movement.getBranch().getId(), newStock);

        inventoryMovementRepository.delete(movement);
    }

    @Override
    public List<InventoryMovementResponse> getMovementsByBranch(String branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + branchId));

        List<InventoryMovement> movements = inventoryMovementRepository.findByBranch(branch);
        return movements.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryMovementResponse> getMovementsByProduct(String productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        List<InventoryMovement> movements = inventoryMovementRepository.findByProduct(product);
        return movements.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryMovementResponse> getMovementsByType(InventoryMovement.MovementType movementType) {
        // We need to use findAll and filter since the repository method uses Pageable
        List<InventoryMovement> movements = inventoryMovementRepository.findAll()
                .stream()
                .filter(movement -> movement.getMovementType() == movementType)
                .collect(Collectors.toList());

        return movements.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryMovementResponse> getMovementsByDateRange(LocalDate startDate, LocalDate endDate) {
        List<InventoryMovement> movements = inventoryMovementRepository.findByMovementDateBetween(startDate, endDate);
        return movements.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryMovementResponse> getMovementsByBranchAndDateRange(String branchId, LocalDate startDate,
            LocalDate endDate) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + branchId));

        // Use findAll and filter since we need List instead of Page
        List<InventoryMovement> movements = inventoryMovementRepository.findAll()
                .stream()
                .filter(movement -> movement.getBranch().equals(branch) &&
                        !movement.getMovementDate().isBefore(startDate) &&
                        !movement.getMovementDate().isAfter(endDate))
                .collect(Collectors.toList());

        return movements.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Integer getCurrentStock(String productId, String branchId) {
        // Calculate current stock based on all movements for this product and branch
        Branch branch = branchRepository.findById(branchId).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);

        if (branch == null || product == null) {
            return 0;
        }

        List<InventoryMovement> movements = inventoryMovementRepository.findByBranchAndProduct(branch, product);

        int totalStock = 0;
        for (InventoryMovement movement : movements) {
            switch (movement.getMovementType()) {
                case IMPORT:
                    totalStock += movement.getQuantity();
                    break;
                case EXPORT:
                    totalStock -= movement.getQuantity();
                    break;
                // ADJUST movements would need specific logic based on requirements
            }
        }
        return Math.max(0, totalStock); // Ensure stock never goes below 0
    }

    @Override
    public Integer getTotalStock(String productId) {
        // Calculate total stock of a product across all branches
        Product product = productRepository.findById(productId).orElse(null);

        if (product == null) {
            return 0;
        }

        // Get all movements for this product across all branches
        List<InventoryMovement> movements = inventoryMovementRepository.findByProduct(product);

        int totalStock = 0;
        for (InventoryMovement movement : movements) {
            switch (movement.getMovementType()) {
                case IMPORT:
                    totalStock += movement.getQuantity();
                    break;
                case EXPORT:
                    totalStock -= movement.getQuantity();
                    break;
                // ADJUST movements would need specific logic based on requirements
            }
        }

        return Math.max(0, totalStock); // Ensure stock never goes below 0
    }

    @Override
    public boolean isStockSufficient(String productId, String branchId, Integer quantity) {
        Integer currentStock = getCurrentStock(productId, branchId);
        return currentStock >= quantity;
    }

    private void updateInventoryStock(String productId, String branchId, Integer newStock) {
        // This would update the Inventory table if you have one
        // For now, we'll skip this since we're calculating stock from movements
        // You can implement this based on your Inventory entity structure
    }

    private InventoryMovementResponse convertToResponse(InventoryMovement movement) {
        InventoryMovementResponse response = new InventoryMovementResponse();
        response.setId(movement.getId());
        response.setMovementType(movement.getMovementType());
        response.setBranchId(movement.getBranch().getId());
        response.setBranchName(movement.getBranch().getName());
        response.setProductId(movement.getProduct().getId());
        response.setProductName(movement.getProduct().getName());
        // Set category info if available
        if (movement.getProduct().getCategory() != null) {
            response.setCategoryId(movement.getProduct().getCategory());
            response.setCategoryName(movement.getProduct().getCategory());
        }

        response.setQuantity(movement.getQuantity());
        response.setBalanceQuantity(movement.getBalanceQuantity());
        response.setMovementDate(movement.getMovementDate());
        response.setNotes(movement.getNotes());
        response.setCreatedAt(movement.getCreatedAt());

        return response;
    }
}
