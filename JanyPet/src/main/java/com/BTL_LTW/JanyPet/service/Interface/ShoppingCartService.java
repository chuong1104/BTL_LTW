package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.CartDetailCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.CartDetailUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ShoppingCartResponse;

public interface ShoppingCartService {
    ShoppingCartResponse getShoppingCart(String userId);
    ShoppingCartResponse addCartDetail(String userId, CartDetailCreationRequest request);
    ShoppingCartResponse updateCartDetail(String userId, String cartDetailId, CartDetailUpdateRequest request);
    ShoppingCartResponse removeCartDetail(String userId, String cartDetailId);
}
