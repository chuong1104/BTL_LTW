package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.ProductCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ProductUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductCreationRequest request);
    ProductResponse updateProduct(String id, ProductUpdateRequest request);
    ProductResponse getProductById(String id);
    List<ProductResponse> getAllProducts(); // Now returns only active products
    void deleteProduct(String id); // Hard delete (kept for backward compatibility)
    void softDeleteProduct(String id); // New soft delete method
    ProductResponse restoreProduct(String id); // Method to restore soft-deleted product
    List<ProductResponse> searchProductsByName(String name); // Will now return only active products
    List<ProductResponse> getAllProductsIncludingInactive(); // New method for admin
}
