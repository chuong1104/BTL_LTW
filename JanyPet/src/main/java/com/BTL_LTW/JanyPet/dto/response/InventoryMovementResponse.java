package com.BTL_LTW.JanyPet.dto.response;

import com.BTL_LTW.JanyPet.entity.InventoryMovement;
import java.time.LocalDate;
import java.sql.Timestamp;

public class InventoryMovementResponse {
    private String id;
    private String branchId;
    private String branchName;
    private String productId;
    private String productName;
    private String categoryId;
    private String categoryName;
    private InventoryMovement.MovementType movementType;
    private Integer quantity;
    private Integer balanceQuantity;
    private LocalDate movementDate;
    private String notes;
    private Timestamp createdAt;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBranchId() {
        return branchId;
    }

    public void setBranchId(String branchId) {
        this.branchId = branchId;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public InventoryMovement.MovementType getMovementType() {
        return movementType;
    }

    public void setMovementType(InventoryMovement.MovementType movementType) {
        this.movementType = movementType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getBalanceQuantity() {
        return balanceQuantity;
    }

    public void setBalanceQuantity(Integer balanceQuantity) {
        this.balanceQuantity = balanceQuantity;
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

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}