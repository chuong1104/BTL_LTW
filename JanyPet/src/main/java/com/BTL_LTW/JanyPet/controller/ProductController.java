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

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        // For USER views, calls the modified productService.getAllProducts()
        List<ProductResponse> list = productService.getAllProducts();
        return ResponseEntity.ok(list);
    }

    // For ADMIN views
    @GetMapping("/all")
    public ResponseEntity<List<ProductResponse>> getAllProductsIncludingInactive() {
        // Ensure ProductService interface has getAllProductsForAdmin and it's implemented
        List<ProductResponse> products = productService.getAllProductsForAdmin(); // Changed this line
        return ResponseEntity.ok(products);
    }
    

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(@RequestParam String name) {
        List<ProductResponse> products = productService.searchProductsByName(name);
        if (products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(products);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ProductResponse>> getFilteredProducts(
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "categoryId", required = false) String categoryId,
            @RequestParam(name = "limit", defaultValue = "8") int limit) {

        List<ProductResponse> products = productService.getFilteredProducts(type, categoryId, limit);
        if (products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(products);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProductResponse> toggleProductStatus(
            @PathVariable String id,
            @RequestParam boolean active) {
        ProductResponse response = productService.toggleProductStatus(id, active);
        return ResponseEntity.ok(response);
    }
}
