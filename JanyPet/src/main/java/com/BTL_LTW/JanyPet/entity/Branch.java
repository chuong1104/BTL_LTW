package com.BTL_LTW.JanyPet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "branch")
public class Branch extends BaseEntity<String> {
    @Column(name = "branch_name", nullable = false, length = 100)
    private String name;

    @Column(name = "branch_source_id")
    private String branchSourceId; // Hash string cho ETL

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "district", length = 50)
    private String district;

    @Column(name = "city", length = 50)
    private String city;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @OneToMany(mappedBy = "branch")
    private List<Inventory> inventories = new ArrayList<>();

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBranchSourceId() {
        return branchSourceId;
    }

    public void setBranchSourceId(String branchSourceId) {
        this.branchSourceId = branchSourceId;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public List<Inventory> getInventories() {
        return inventories;
    }

    public void setInventories(List<Inventory> inventories) {
        this.inventories = inventories;
    }
}