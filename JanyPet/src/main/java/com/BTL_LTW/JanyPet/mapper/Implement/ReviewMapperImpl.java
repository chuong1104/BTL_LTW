package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.dto.request.ReviewCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.ReviewUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ReviewResponse;
import com.BTL_LTW.JanyPet.entity.Review;

import com.BTL_LTW.JanyPet.mapper.Interface.ReviewMapper;
import com.BTL_LTW.JanyPet.repository.ProductRepository;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapperImpl implements ReviewMapper {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public ReviewResponse toDTO(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setUserId(review.getUser().getId());
        response.setProductId(review.getProduct().getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setImage(review.getImage());
        return response;
    }

    @Override
    public Review toEntity(ReviewCreateRequest request) {
        Review review = new Review();
        review.setId(null); // sẽ gán UUID trong service
        review.setUser(userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng")));
        review.setProduct(productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm")));
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setImage(request.getImage());
        return review;
    }

    @Override
    public void updateEntity(Review review, ReviewUpdateRequest request) {
        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }
        if (request.getImage() != null) {
            review.setImage(request.getImage());
        }
    }
}
