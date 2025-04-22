package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.ProductCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ProductUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ProductResponse;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.service.Interface.FileStorageService;
import com.BTL_LTW.JanyPet.service.Interface.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Override
    public ProductResponse createProduct(ProductCreationRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

        // Lưu ảnh và lấy tên file
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String fileName = null;
            try {
                fileName = fileStorageService.storeFile(request.getImage());
                product.setImage(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store image file: " + e.getMessage());
            }
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

        // Cập nhật ảnh nếu có
        if (request.getImage() != null && !request.getImage().isEmpty()) {
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
                fileName = fileStorageService.storeFile(request.getImage());
                product.setImage(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store updated image file: " + e.getMessage());
            }
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
        return productList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
        // Xóa ảnh nếu tồn tại
        if (product.getImage() != null && !product.getImage().isEmpty()) {
            try {
                fileStorageService.deleteFile(product.getImage());
            } catch (Exception e) {
                // Log lỗi nếu cần
                System.err.println("Failed to delete image during product deletion: " + e.getMessage());
            }
        }
        productRepository.deleteById(id);
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        // Chuyển tên file thành URL đầy đủ
        if (product.getImage() != null && !product.getImage().isEmpty()) {
            response.setImageUrl(fileStorageService.getFileUrl(product.getImage()));
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