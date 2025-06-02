package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.ProductCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ProductUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ProductResponse;
import com.BTL_LTW.JanyPet.service.Interface.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Tạo mới sản phẩm - hỗ trợ cả form data và JSON
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody ProductCreationRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.ok(response);
    }
    
    // Tạo mới sản phẩm với upload ảnh qua form data
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProductWithFormData(
            @ModelAttribute ProductCreationRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.ok(response);
    }

    // Cập nhật sản phẩm theo id với JSON
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable String id,
            @RequestBody ProductUpdateRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }
    
    // Cập nhật sản phẩm theo id với form data và file upload
    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> updateProductWithFormData(
            @PathVariable String id,
            @ModelAttribute ProductUpdateRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    // Các endpoint khác không thay đổi
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable String id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    // Endpoint to get active products only - standard product listing
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllActiveProducts() {
        List<ProductResponse> list = productService.getAllProducts();
        return ResponseEntity.ok(list);
    }
    
    // Specific endpoint to get ALL products including inactive (for admin)
    @GetMapping("/all")
    public ResponseEntity<List<ProductResponse>> getAllProductsAdmin() {
        List<ProductResponse> products = productService.getAllProductsIncludingInactive();
        return ResponseEntity.ok(products);
    }

    // Modify the delete endpoint to perform soft delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> softDeleteProduct(@PathVariable String id) {
        productService.softDeleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product successfully deactivated"));
    }
    
    // Add endpoint to restore a soft-deleted product
    @PostMapping("/{id}/restore")
    public ResponseEntity<ProductResponse> restoreProduct(@PathVariable String id) {
        ProductResponse restoredProduct = productService.restoreProduct(id);
        return ResponseEntity.ok(restoredProduct);
    }

    // Add this new endpoint for product search
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(@RequestParam String keyword) {
        List<ProductResponse> products = productService.searchProductsByName(keyword);
        return ResponseEntity.ok(products);
    }
}
