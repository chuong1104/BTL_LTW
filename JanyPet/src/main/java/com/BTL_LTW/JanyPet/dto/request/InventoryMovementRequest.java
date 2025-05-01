package com.BTL_LTW.JanyPet.dto.request;

import java.time.LocalDate;

public class InventoryMovementRequest {
    private String productId;
    private String branchId;
    private Integer quantity;
    private LocalDate movementDate;
    private String notes;
    
    // Getters and Setters
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