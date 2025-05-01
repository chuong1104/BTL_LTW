package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "inventory_movements")
public class InventoryMovement extends BaseEntity<String> {
    
    public enum MovementType {
        IMPORT, EXPORT, ADJUST
    }
    
    @ManyToOne
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;
    
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "movement_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private MovementType movementType;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "balance_quantity", nullable = false)
    private Integer balanceQuantity;
    
    @Column(name = "movement_date", nullable = false)
    private LocalDate movementDate;
    
    @Column(name = "notes", length = 500)
    private String notes;
    
    // Getters and Setters
    public Branch getBranch() {
        return branch;
    }

    public void setBranch(Branch branch) {
        this.branch = branch;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public MovementType getMovementType() {
        return movementType;
    }

    public void setMovementType(MovementType movementType) {
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
}