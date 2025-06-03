package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.ProductCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ProductUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ProductResponse;
import com.BTL_LTW.JanyPet.entity.Category;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.exception.ResourceNotFoundException;
import com.BTL_LTW.JanyPet.repository.CategoryRepository;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.service.Interface.FileStorageService;
import com.BTL_LTW.JanyPet.service.Interface.ProductService;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        List<Product> existingProducts = productRepository.findByName(request.getName());
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
        // Modified to only retrieve active products
        Product product = productRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        // Only return active products for normal users
        return productRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(String id) {
        // Hard delete (retained for backward compatibility)
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
    
    @Override
    public void softDeleteProduct(String id) {
        // Implement soft delete by setting isActive to false
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        
        Product product = optionalProduct.get();
        product.setActive(false); // Set isActive to false
        productRepository.save(product);
    }
    
    @Override
    public ProductResponse restoreProduct(String id) {
        // Restore a soft-deleted product by setting isActive to true
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        
        Product product = optionalProduct.get();
        product.setActive(true); // Set isActive to true
        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> searchProductsByName(String name) {
        // Modified to only retrieve active products
        return productRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ProductResponse> getAllProductsIncludingInactive() {
        // Return all products including inactive ones (for admin use)
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void permanentlyDeleteProduct(String id) {
        // Add logging to help debug
        System.out.println("Starting permanent deletion for product: " + id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        
        try {
            // Delete product from database
            productRepository.deleteById(id);
            System.out.println("Product deleted from database successfully");
            
            // If product has an image, delete it
            if (product.getImage() != null && !product.getImage().isEmpty()) {
                // Logic to delete file - may need to adapt based on your fileStorageService
                String filename = product.getImage().substring(product.getImage().lastIndexOf("/") + 1);
                System.out.println("Attempting to delete file: " + filename);
                // Comment this out if you don't have a fileStorageService
                // fileStorageService.deleteFile(filename);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to permanently delete product: " + e.getMessage(), e);
        }
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        response.setIsActive(product.getActive()); // Include active status in response

        // Construct full image URL if imageUrl is just a filename
        String imageUrl = product.getImage();
        if (imageUrl != null && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
            // Assuming images are served from a specific path, e.g., /uploads/
            // Adjust this path based on your FileStorageService configuration
            response.setImageUrl("/uploads/" + imageUrl);
        } else {
            response.setImageUrl(imageUrl);
        }

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
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
}