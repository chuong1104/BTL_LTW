package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.CategoryCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.CategoryUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CategoryResponse;
import com.BTL_LTW.JanyPet.entity.Category;
import com.BTL_LTW.JanyPet.repository.CategoryRepository;

import com.BTL_LTW.JanyPet.service.Interface.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(String id, CategoryUpdateRequest request) {
        Optional<Category> optionalCategory = categoryRepository.findById(id);
        if (optionalCategory.isEmpty()) {
            throw new RuntimeException("Không tìm thấy Category với id: " + id);
        }
        Category category = optionalCategory.get();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    public CategoryResponse getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Category với id: " + id));
        return mapToResponse(category);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Category với id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        return response;
    }
}
