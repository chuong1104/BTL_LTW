package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.ProductCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ProductUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ProductResponse;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.repository.ProductRepository;

import com.BTL_LTW.JanyPet.service.Interface.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public ProductResponse createProduct(ProductCreationRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImage(request.getImage());
        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Override
    public ProductResponse updateProduct(String id, ProductUpdateRequest request) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if(optionalProduct.isEmpty()){
            // Tùy vào cách xử lý lỗi của bạn, có thể ném exception
            throw new RuntimeException("Không tìm thấy sản phẩm với id: " + id);
        }
        Product product = optionalProduct.get();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImage(request.getImage());
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
        if(!productRepository.existsById(id)){
            throw new RuntimeException("Không tìm thấy sản phẩm với id: " + id);
        }
        productRepository.deleteById(id);
    }

    // Phương thức chuyển đổi Entity -> DTO response
    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        response.setImage(product.getImage());
        return response;
    }
}
