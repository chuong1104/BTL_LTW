package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.ProductCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.ProductUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ProductResponse;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.service.Interface.FileStorageService;
import com.BTL_LTW.JanyPet.service.Interface.InventoryService;
import com.BTL_LTW.JanyPet.service.Interface.ProductService;
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
    private InventoryService inventoryService;

    @Override
    public ProductResponse createProduct(ProductCreationRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setCategory(request.getCategory());

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
        product.setStock(inventoryService.calculateTotalStock(product.getId()));
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
        product.setPurchasePrice(request.getPurchasePrice()); // Thêm dòng này
        product.setCategory(request.getCategory());

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
        product.setStock(inventoryService.calculateTotalStock(id));
        return mapToResponse(product);
    }

    @Override
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
        product.setStock(inventoryService.calculateTotalStock(id));
        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        List<Product> productList = productRepository.findAll();
        productList.forEach(product -> product.setStock(inventoryService.calculateTotalStock(product.getId())));

        return productList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getProductsByCategory(String category) {
        List<Product> productList = productRepository.findByCategory(category);
        productList.forEach(product -> product.setStock(inventoryService.calculateTotalStock(product.getId())));

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
        response.setPurchasePrice(product.getPurchasePrice());
        response.setStock(product.getStock());
        response.setCategory(product.getCategory());

        // Chuyển tên file thành URL đầy đủ
        if (product.getImage() != null && !product.getImage().isEmpty()) {
            // Nếu image không bắt đầu bằng http hoặc https, thì thêm tiền tố /uploads/
            String imageUrl = product.getImage();
            if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")
                    && !imageUrl.startsWith("/uploads/")) {
                imageUrl = "/uploads/" + imageUrl;
            }
            response.setImageUrl(imageUrl);
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