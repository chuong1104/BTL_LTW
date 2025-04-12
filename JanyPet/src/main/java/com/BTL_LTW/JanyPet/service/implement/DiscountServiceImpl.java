package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.DiscountCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.DiscountUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.DiscountResponse;
import com.BTL_LTW.JanyPet.entity.Discount;
import com.BTL_LTW.JanyPet.entity.Product;
import com.BTL_LTW.JanyPet.repository.DiscountRepository;
import com.BTL_LTW.JanyPet.repository.ProductRepository;

import com.BTL_LTW.JanyPet.service.Interface.DiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DiscountServiceImpl implements DiscountService {

    @Autowired
    private DiscountRepository discountRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public DiscountResponse createDiscount(DiscountCreateRequest request) {
        Discount discount = new Discount();
        // Lấy Product theo id được gửi từ request
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Product với id: " + request.getProductId()));
        discount.setProduct(product);
        discount.setDiscountPercent(request.getDiscountPercent());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        discount = discountRepository.save(discount);
        return mapToResponse(discount);
    }

    @Override
    public DiscountResponse updateDiscount(String id, DiscountUpdateRequest request) {
        Optional<Discount> optionalDiscount = discountRepository.findById(id);
        if(optionalDiscount.isEmpty()){
            throw new RuntimeException("Không tìm thấy Discount với id: " + id);
        }
        Discount discount = optionalDiscount.get();
        discount.setDiscountPercent(request.getDiscountPercent());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        discount = discountRepository.save(discount);
        return mapToResponse(discount);
    }

    @Override
    public DiscountResponse getDiscountById(String id) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Discount với id: " + id));
        return mapToResponse(discount);
    }

    @Override
    public List<DiscountResponse> getAllDiscounts() {
        return discountRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteDiscount(String id) {
        if(!discountRepository.existsById(id)){
            throw new RuntimeException("Không tìm thấy Discount với id: " + id);
        }
        discountRepository.deleteById(id);
    }

    private DiscountResponse mapToResponse(Discount discount) {
        DiscountResponse response = new DiscountResponse();
        response.setId(discount.getId());
        response.setProductId(discount.getProduct().getId());
        response.setDiscountPercent(discount.getDiscountPercent());
        response.setStartDate(discount.getStartDate());
        response.setEndDate(discount.getEndDate());
        return response;
    }
}
