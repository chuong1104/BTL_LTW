package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.ProductCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ProductUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ProductResponse;
import com.BTL_LTW.JanyPet.service.Interface.ProductService;
import com.BTL_LTW.JanyPet.service.Interface.InventoryMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @Autowired
    private InventoryMovementService inventoryMovementService;

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

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        List<ProductResponse> list = productService.getAllProducts();
        return ResponseEntity.ok(list);
    }

    // Get all products with total stock across all branches
    @GetMapping("/with-total-stock")
    public ResponseEntity<List<Map<String, Object>>> getAllProductsWithTotalStock() {
        try {
            List<ProductResponse> products = productService.getAllProducts();
            List<Map<String, Object>> productsWithStock = new java.util.ArrayList<>();

            for (ProductResponse product : products) {
                Map<String, Object> productMap = new HashMap<>();
                productMap.put("id", product.getId());
                productMap.put("name", product.getName());
                productMap.put("category", product.getCategory());
                productMap.put("description", product.getDescription());
                productMap.put("price", product.getPrice());
                productMap.put("purchasePrice", product.getPurchasePrice());
                productMap.put("imageUrl", product.getImageUrl());

                // Get total stock across all branches
                Integer totalStock = inventoryMovementService.getTotalStock(product.getId());
                productMap.put("totalStock", totalStock);

                productsWithStock.add(productMap);
            }

            return ResponseEntity.ok(productsWithStock);
        } catch (Exception e) {
            System.err.println("Error getting products with total stock: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }// Get products by category name (expects category name as String, e.g., "Dogs",
     // "Cats")

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable String category) {
        List<ProductResponse> list = productService.getProductsByCategory(category);
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
