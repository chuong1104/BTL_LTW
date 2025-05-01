package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory",
       uniqueConstraints = @UniqueConstraint(columnNames = {"branch_id", "product_id"}))
public class Inventory extends BaseEntity<String> {
    
    @ManyToOne
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;
    
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0;
    
    @Column(name = "reorder_level")
    private Integer reorderLevel = 10;

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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }
}