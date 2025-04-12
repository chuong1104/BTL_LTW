package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.ProductCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ProductUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ProductResponse;
import com.BTL_LTW.JanyPet.service.Interface.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Tạo mới sản phẩm
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductCreationRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.ok(response);
    }

    // Cập nhật sản phẩm theo id
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable String id,
                                                         @RequestBody ProductUpdateRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    // Lấy thông tin sản phẩm theo id
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable String id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    // Lấy danh sách tất cả sản phẩm
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> list = productService.getAllProducts();
        return ResponseEntity.ok(list);
    }

    // Xóa sản phẩm theo id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
