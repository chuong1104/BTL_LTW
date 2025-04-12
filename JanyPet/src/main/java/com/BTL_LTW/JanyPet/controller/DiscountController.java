package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.DiscountCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.DiscountUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.DiscountResponse;

import com.BTL_LTW.JanyPet.service.Interface.DiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
public class DiscountController {

    @Autowired
    private DiscountService discountService;

    @PostMapping
    public ResponseEntity<DiscountResponse> createDiscount(@RequestBody DiscountCreateRequest request) {
        DiscountResponse response = discountService.createDiscount(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountResponse> updateDiscount(@PathVariable String id,
                                                           @RequestBody DiscountUpdateRequest request) {
        DiscountResponse response = discountService.updateDiscount(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiscountResponse> getDiscountById(@PathVariable String id) {
        DiscountResponse response = discountService.getDiscountById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DiscountResponse>> getAllDiscounts() {
        List<DiscountResponse> list = discountService.getAllDiscounts();
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscount(@PathVariable String id) {
        discountService.deleteDiscount(id);
        return ResponseEntity.noContent().build();
    }
}
