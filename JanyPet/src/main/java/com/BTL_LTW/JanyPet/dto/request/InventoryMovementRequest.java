package com.BTL_LTW.JanyPet.dto.request;

import com.BTL_LTW.JanyPet.entity.InventoryMovement;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class InventoryMovementRequest {

    @NotNull(message = "Movement type is required")
    private InventoryMovement.MovementType movementType;

    @NotBlank(message = "Product ID is required")
    private String productId;

    @NotBlank(message = "Branch ID is required")
    private String branchId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @NotNull(message = "Movement date is required")
    private LocalDate movementDate;

    private String notes;

    // Getters and Setters
    public InventoryMovement.MovementType getMovementType() {
        return movementType;
    }

    public void setMovementType(InventoryMovement.MovementType movementType) {
        this.movementType = movementType;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getBranchId() {
        return branchId;
    }

    public void setBranchId(String branchId) {
        this.branchId = branchId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDate getMovementDate() {
        return movementDate;
    }

    public void setMovementDate(LocalDate movementDate) {
        this.movementDate = movementDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}