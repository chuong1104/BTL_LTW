package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.ProductCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ProductUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductCreationRequest request);

    ProductResponse updateProduct(String id, ProductUpdateRequest request);

    ProductResponse getProductById(String id);

    List<ProductResponse> getAllProducts();

    // Get products filtered by category name (expects category name as String)
    List<ProductResponse> getProductsByCategory(String category);

    void deleteProduct(String id);
}
