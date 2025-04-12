package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.CartDetailCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.CartDetailUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ShoppingCartResponse;
import com.BTL_LTW.JanyPet.service.Interface.ShoppingCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class ShoppingCartController {

    @Autowired
    private ShoppingCartService shoppingCartService;

    @GetMapping("/{userId}")
    public ResponseEntity<ShoppingCartResponse> getCart(@PathVariable String userId) {
        ShoppingCartResponse response = shoppingCartService.getShoppingCart(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<ShoppingCartResponse> addCartDetail(
            @PathVariable String userId,
            @RequestBody CartDetailCreationRequest request) {
        ShoppingCartResponse response = shoppingCartService.addCartDetail(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}/update/{cartDetailId}")
    public ResponseEntity<ShoppingCartResponse> updateCartDetail(
            @PathVariable String userId,
            @PathVariable String cartDetailId,
            @RequestBody CartDetailUpdateRequest request) {
        ShoppingCartResponse response = shoppingCartService.updateCartDetail(userId, cartDetailId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}/remove/{cartDetailId}")
    public ResponseEntity<ShoppingCartResponse> removeCartDetail(
            @PathVariable String userId,
            @PathVariable String cartDetailId) {
        ShoppingCartResponse response = shoppingCartService.removeCartDetail(userId, cartDetailId);
        return ResponseEntity.ok(response);
    }
}
