package com.BTL_LTW.JanyPet.common;

public enum ShippingMethod {
    STANDARD("Giao hàng tiêu chuẩn"),
    FAST("Giao hàng nhanh"),
    SAME_DAY("Giao hàng trong ngày");
    
    private final String displayName;
    
    ShippingMethod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}