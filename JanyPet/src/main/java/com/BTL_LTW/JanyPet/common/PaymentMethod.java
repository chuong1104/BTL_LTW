package com.BTL_LTW.JanyPet.common;

public enum PaymentMethod {
    COD("Thanh toán khi nhận hàng"),
    CREDIT_CARD("Thẻ tín dụng/Ghi nợ"),
    VNPAY("VNPAY"),
    MOMO("MoMo"),
    BANK_TRANSFER("Chuyển khoản ngân hàng");
    
    private final String displayName;
    
    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
