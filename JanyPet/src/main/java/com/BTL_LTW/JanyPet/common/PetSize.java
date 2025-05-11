package com.BTL_LTW.JanyPet.common;

public enum PetSize {
    SMALL("Dưới 5kg"),
    MEDIUM("5-10kg"),
    LARGE("10-20kg"),
    XLARGE("Trên 20kg");
    
    private final String description;
    
    PetSize(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}