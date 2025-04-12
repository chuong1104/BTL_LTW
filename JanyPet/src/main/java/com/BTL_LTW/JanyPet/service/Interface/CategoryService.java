package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.CategoryCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.CategoryUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryCreateRequest request);
    CategoryResponse updateCategory(String id, CategoryUpdateRequest request);
    CategoryResponse getCategoryById(String id);
    List<CategoryResponse> getAllCategories();
    void deleteCategory(String id);
}
