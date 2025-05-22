package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.ProductCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ProductUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.CategoryResponse;
import com.BTL_LTW.JanyPet.dto.response.ProductResponse;
import com.BTL_LTW.JanyPet.entity.Category;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.repository.CategoryRepository;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.service.Interface.FileStorageService;
import com.BTL_LTW.JanyPet.service.Interface.ProductService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.io.IOException;
import java.util.Collections;
import java.util.List; // Ensure this is present
import java.util.Optional; // Ensure this is present
import java.util.stream.Collectors; // Ensure this is present

import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.io.IOException;
import java.util.Collections;
import java.util.List; // Ensure this is present
import java.util.Optional; // Ensure this is present
import java.util.stream.Collectors; // Ensure this is present


@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public ProductResponse createProduct(ProductCreationRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        // Handle Category
        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }


        // Xử lý 2 trường hợp: upload file hoặc chỉ có đường dẫn ảnh
        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            // Trường hợp 1: Có file được upload
            String fileName = null;
            try {
                fileName = fileStorageService.storeFile(request.getImageFile());
                product.setImage(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store image file: " + e.getMessage());
            }
        } else if (request.getImagePath() != null && !request.getImagePath().isEmpty()) {
            // Trường hợp 2: Có đường dẫn ảnh
            // Nếu đường dẫn bắt đầu bằng "/uploads/", chỉ lấy tên file
            String imagePath = request.getImagePath();
            if (imagePath.startsWith("/uploads/")) {
                imagePath = imagePath.substring("/uploads/".length());
            }
            product.setImage(imagePath);
        }

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public ProductResponse updateProduct(String id, ProductUpdateRequest request) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            throw new RuntimeException("Không tìm thấy sản phẩm với id: " + id);
        }

        // Kiểm tra sản phẩm tương tự
        List<Product> existingProducts = productRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(request.getName());
        for (Product existingProduct : existingProducts) {
            if (!existingProduct.getId().equals(id) && isSimilarProduct(existingProduct, request)) {
                throw new RuntimeException("Sản phẩm tương tự đã tồn tại!");
            }
        }

        Product product = optionalProduct.get();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

         // Handle Category Update
         if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null); // Allow unsetting category
        }


        // Xử lý trường hợp upload file mới
        MultipartFile imageFile = request.getImageFile();
        if (imageFile != null && !imageFile.isEmpty()) {
            // Xóa ảnh cũ nếu tồn tại
            if (product.getImage() != null && !product.getImage().isEmpty()) {
                try {
                    fileStorageService.deleteFile(product.getImage());
                } catch (Exception e) {
                    // Log lỗi nếu cần, nhưng không làm gián đoạn quá trình
                    System.err.println("Failed to delete old image: " + e.getMessage());
                }
            }

            String fileName = null;
            try {
                fileName = fileStorageService.storeFile(imageFile);
                product.setImage(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store updated image file: " + e.getMessage());
            }
        } 
        // Xử lý trường hợp chỉ có đường dẫn ảnh
        else if (request.getImagePath() != null && !request.getImagePath().isEmpty()) {
            String imagePath = request.getImagePath();
            if (imagePath.startsWith("/uploads/")) {
                imagePath = imagePath.substring("/uploads/".length());
            }
            product.setImage(imagePath);
        }

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {

        List<Product> productList = productRepository.findAll();

        return productRepository.findAll().stream()
                .filter(product -> product.getActive() && product.getCategory() != null && product.getCategory().getActive())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }






    @Override
    public List<ProductResponse> getAllProductsForAdmin() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        
        product.setActive(false); // Soft delete
        productRepository.save(product);
    }

    @Override
    public List<ProductResponse> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name).stream()
                .filter(product -> product.getCategory() != null && product.getCategory().getActive())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        response.setActive(product.getActive()); // Product's own active status

        String imageUrl = product.getImage();
        if (imageUrl != null && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
            response.setImageUrl("/uploads/" + imageUrl);
        } else {
            response.setImageUrl(imageUrl);
        }

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
            response.setCategoryActive(product.getCategory().getActive()); // Category's active status
        } else {
            response.setCategoryActive(null); // Or a default like false
        }
        return response;
    }

    private boolean isSimilarProduct(Product product, ProductUpdateRequest request) {
        boolean sameName = product.getName().equals(request.getName());
        boolean sameDescription = (product.getDescription() == null && request.getDescription() == null) ||
                (product.getDescription() != null &&
                        product.getDescription().equals(request.getDescription()));
        boolean samePrice = product.getPrice().equals(request.getPrice());
        return sameName && sameDescription && samePrice;
    }

    @Override
    public ProductResponse toggleProductStatus(String id, boolean isActive) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        product.setActive(isActive);
        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    @Override
    public List<ProductResponse> getFilteredProducts(String type, String categoryId, int limit) {
        Pageable pageable;
        Page<Product> productPage;

        if (type != null && "bestselling".equalsIgnoreCase(type)) {
            // For "bestselling", using newest products as a proxy.
            // Requires: Page<Product> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable); in ProductRepository
            pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
            productPage = productRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
        } else if (categoryId != null && !categoryId.isEmpty()) {
            // Filter by categoryId
            // Requires: Page<Product> findByCategoryIdAndIsActiveTrue(String categoryId, Pageable pageable); in ProductRepository
            pageable = PageRequest.of(0, limit);
            productPage = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        } else {
            // No specific filter, return all active products up to the limit
            // Requires: Page<Product> findByIsActiveTrue(Pageable pageable); in ProductRepository
            pageable = PageRequest.of(0, limit);
            productPage = productRepository.findByIsActiveTrue(pageable);
        }

        if (productPage == null || !productPage.hasContent()) {
            return Collections.emptyList();
        }

        // Filter for active product (if not already handled by repo) and active category, then map to response
        return productPage.getContent().stream()
                .filter(product -> product.getActive() && (product.getCategory() != null && product.getCategory().getActive()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
