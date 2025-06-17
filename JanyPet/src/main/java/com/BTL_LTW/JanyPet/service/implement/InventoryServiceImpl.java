package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.InventoryMovementRequest;
import com.BTL_LTW.JanyPet.dto.response.InventoryMovementResponse;
import com.BTL_LTW.JanyPet.dto.response.InventoryResponse;
import com.BTL_LTW.JanyPet.entity.Branch;
import com.BTL_LTW.JanyPet.entity.Inventory;
import com.BTL_LTW.JanyPet.entity.InventoryMovement;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.repository.BranchRepository;
import com.BTL_LTW.JanyPet.repository.InventoryMovementRepository;
import com.BTL_LTW.JanyPet.repository.InventoryRepository;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.service.Interface.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryMovementRepository movementRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryResponse> getInventoryByBranch(String branchId) {
        Branch branch = getBranchById(branchId);
        return inventoryRepository.findByBranch(branch).stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryResponse> getInventoryByProduct(String productId) {
        Product product = getProductById(productId);
        return inventoryRepository.findByProduct(product).stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryResponse getInventoryByBranchAndProduct(String branchId, String productId) {
        Branch branch = getBranchById(branchId);
        Product product = getProductById(productId);

        Inventory inventory = inventoryRepository.findByBranchAndProduct(branch, product)
                .orElseThrow(() -> new RuntimeException("Inventory not found for branch and product"));

        return mapToInventoryResponse(inventory);
    }

    @Override
    public List<InventoryResponse> getLowStockInventory(String branchId) {
        if (branchId != null && !branchId.isEmpty()) {
            Branch branch = getBranchById(branchId);
            List<Inventory> lowStockItems = new ArrayList<>();

            // Get items with quantity below their reorder level but not zero
            inventoryRepository.findByBranch(branch).forEach(inventory -> {
                if (inventory.getQuantity() <= inventory.getReorderLevel() && inventory.getQuantity() > 0) {
                    lowStockItems.add(inventory);
                }
            });

            return lowStockItems.stream()
                    .map(this::mapToInventoryResponse)
                    .collect(Collectors.toList());
        } else {
            // For all branches
            List<Inventory> lowStockItems = new ArrayList<>();

            inventoryRepository.findAll().forEach(inventory -> {
                if (inventory.getQuantity() <= inventory.getReorderLevel() && inventory.getQuantity() > 0) {
                    lowStockItems.add(inventory);
                }
            });

            return lowStockItems.stream()
                    .map(this::mapToInventoryResponse)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public List<InventoryResponse> getOutOfStockInventory(String branchId) {
        if (branchId != null && !branchId.isEmpty()) {
            Branch branch = getBranchById(branchId);
            return inventoryRepository.findByBranchAndQuantityLessThanEqual(branch, 0).stream()
                    .map(this::mapToInventoryResponse)
                    .collect(Collectors.toList());
        } else {
            // For all branches
            return inventoryRepository.findByQuantityEquals(0).stream()
                    .map(this::mapToInventoryResponse)
                    .collect(Collectors.toList());
        }
    }

    @Override
    @Transactional
    public InventoryMovementResponse importInventory(InventoryMovementRequest request) {
        // Validate request
        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Import quantity must be greater than zero");
        }

        Branch branch = getBranchById(request.getBranchId());
        Product product = getProductById(request.getProductId());

        // Get or create inventory
        Inventory inventory = getOrCreateInventory(branch, product);

        // Keep track of original quantity for logging purposes
        int originalQuantity = inventory.getQuantity();

        // Update inventory quantity
        int newQuantity = inventory.getQuantity() + request.getQuantity();
        inventory.setQuantity(newQuantity);
        inventoryRepository.save(inventory);

        // Create movement record - use the new inventory quantity as balance
        InventoryMovement movement = createMovementRecord(
                branch, product, InventoryMovement.MovementType.IMPORT,
                request.getQuantity(), newQuantity, // Use new inventory quantity
                request.getMovementDate(), request.getNotes());

        return mapToMovementResponse(movement);
    }

    @Override
    @Transactional
    public InventoryMovementResponse exportInventory(InventoryMovementRequest request) {
        // Validate request
        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Export quantity must be greater than zero");
        }

        Branch branch = getBranchById(request.getBranchId());
        Product product = getProductById(request.getProductId());

        // Get inventory
        Inventory inventory = inventoryRepository.findByBranchAndProduct(branch, product)
                .orElseThrow(() -> new RuntimeException("No inventory found for this product at this branch"));

        // Check if enough quantity
        if (inventory.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Not enough quantity in stock to export");
        }

        // Update inventory quantity
        int newQuantity = inventory.getQuantity() - request.getQuantity();
        inventory.setQuantity(newQuantity);
        inventoryRepository.save(inventory);

        // Create movement record
        InventoryMovement movement = createMovementRecord(
                branch, product, InventoryMovement.MovementType.EXPORT,
                request.getQuantity(), newQuantity,
                request.getMovementDate(), request.getNotes());

        return mapToMovementResponse(movement);
    }

    @Override
    @Transactional
    public InventoryMovementResponse adjustInventory(InventoryMovementRequest request) {
        Branch branch = getBranchById(request.getBranchId());
        Product product = getProductById(request.getProductId());

        // Get inventory
        Inventory inventory = getOrCreateInventory(branch, product);

        // Calculate adjustment (could be positive or negative)
        int adjustmentQuantity = request.getQuantity() - inventory.getQuantity();
        InventoryMovement.MovementType movementType = adjustmentQuantity >= 0 ? InventoryMovement.MovementType.IMPORT
                : InventoryMovement.MovementType.EXPORT;

        // Update inventory quantity
        inventory.setQuantity(request.getQuantity());
        inventoryRepository.save(inventory);

        // Create movement record
        InventoryMovement movement = createMovementRecord(
                branch, product, InventoryMovement.MovementType.ADJUST,
                Math.abs(adjustmentQuantity), request.getQuantity(),
                request.getMovementDate(), request.getNotes());

        return mapToMovementResponse(movement);
    }

    @Override
    public List<InventoryMovementResponse> getInventoryMovements(
            String branchId, String productId, String movementType,
            LocalDate fromDate, LocalDate toDate, int page, int size) {

        PageRequest pageRequest = PageRequest.of(
                page, size, Sort.by("movementDate").descending()
                        .and(Sort.by("createdAt").descending()));

        Page<InventoryMovement> movements;

        if (branchId != null && !branchId.isEmpty()) {
            Branch branch = getBranchById(branchId);

            if (fromDate != null && toDate != null) {
                movements = movementRepository.findByBranchAndMovementDateBetween(
                        branch, fromDate, toDate, pageRequest);
            } else {
                movements = movementRepository.findByBranch(branch, pageRequest);
            }
        } else if (movementType != null && !movementType.isEmpty()) {
            try {
                InventoryMovement.MovementType type = InventoryMovement.MovementType.valueOf(movementType);
                movements = movementRepository.findByMovementType(type, pageRequest);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid movement type");
            }
        } else {
            movements = movementRepository.findAll(pageRequest);
        }

        return movements.getContent().stream()
                .map(this::mapToMovementResponse)
                .collect(Collectors.toList());
    }

    // Helper methods
    private Branch getBranchById(String branchId) {
        return branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + branchId));
    }

    private Product getProductById(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
    }

    private Inventory getOrCreateInventory(Branch branch, Product product) {
        Optional<Inventory> optInventory = inventoryRepository.findByBranchAndProduct(branch, product);

        if (optInventory.isPresent()) {
            return optInventory.get();
        } else {
            // Create new inventory record
            Inventory inventory = new Inventory();
            inventory.setBranch(branch);
            inventory.setProduct(product);
            inventory.setQuantity(0);
            inventory.setReorderLevel(10); // Default reorder level
            return inventoryRepository.save(inventory);
        }
    }

    public Integer calculateTotalStock(String productId) {
        Product product = getProductById(productId);
        return inventoryRepository.findByProduct(product)
                .stream()
                .mapToInt(Inventory::getQuantity)
                .sum();
    }

    private InventoryMovement createMovementRecord(
            Branch branch, Product product,
            InventoryMovement.MovementType type,
            int quantity, int balanceQuantity,
            LocalDate movementDate, String notes) {

        InventoryMovement movement = new InventoryMovement();
        movement.setBranch(branch);
        movement.setProduct(product);
        movement.setMovementType(type);
        movement.setQuantity(quantity);
        movement.setBalanceQuantity(balanceQuantity);
        movement.setMovementDate(movementDate != null ? movementDate : LocalDate.now());
        movement.setNotes(notes);

        return movementRepository.save(movement);
    }

    private InventoryResponse mapToInventoryResponse(Inventory inventory) {
        InventoryResponse response = new InventoryResponse();
        response.setId(inventory.getId());
        response.setBranchId(inventory.getBranch().getId());
        response.setBranchName(inventory.getBranch().getName());
        response.setProductId(inventory.getProduct().getId());
        response.setProductName(inventory.getProduct().getName());
        response.setQuantity(inventory.getQuantity());
        response.setReorderLevel(inventory.getReorderLevel());

        // Set status based on quantity
        if (inventory.getQuantity() <= 0) {
            response.setStatus("OUT_OF_STOCK");
        } else if (inventory.getQuantity() <= inventory.getReorderLevel()) {
            response.setStatus("LOW_STOCK");
        } else {
            response.setStatus("IN_STOCK");
        }

        return response;
    }

    private InventoryMovementResponse mapToMovementResponse(InventoryMovement movement) {
        InventoryMovementResponse response = new InventoryMovementResponse();
        response.setId(movement.getId());
        response.setBranchId(movement.getBranch().getId());
        response.setBranchName(movement.getBranch().getName());
        response.setProductId(movement.getProduct().getId());
        response.setProductName(movement.getProduct().getName());
        response.setMovementType(movement.getMovementType());
        response.setQuantity(movement.getQuantity());
        response.setBalanceQuantity(movement.getBalanceQuantity());
        response.setMovementDate(movement.getMovementDate());
        response.setNotes(movement.getNotes());
        response.setCreatedAt(movement.getCreatedAt());
        return response;
    }
}