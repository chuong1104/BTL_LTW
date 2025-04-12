package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.dto.request.ReviewCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.ReviewUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ReviewResponse;
import com.BTL_LTW.JanyPet.entity.Review;
import com.BTL_LTW.JanyPet.mapper.Interface.ReviewMapper;
import com.BTL_LTW.JanyPet.repository.ReviewRepository;
import com.BTL_LTW.JanyPet.service.Interface.ReviewService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewMapper reviewMapper; // Sử dụng interface, không dùng cụ thể ReviewMapperImpl

    @Override
    public ReviewResponse createReview(ReviewCreateRequest request) {
        Review review = reviewMapper.toEntity(request);
        review.setId(UUID.randomUUID().toString()); // Gán ID ở đây
        return reviewMapper.toDTO(reviewRepository.save(review));
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(reviewMapper::toDTO)
                .toList();
    }

    @Override
    public ReviewResponse getReviewById(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy review với ID: " + id));
        return reviewMapper.toDTO(review);
    }

    @Override
    public ReviewResponse updateReview(String id, ReviewUpdateRequest request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy review với ID: " + id));
        reviewMapper.updateEntity(review, request);
        return reviewMapper.toDTO(reviewRepository.save(review));
    }

    @Override
    public void deleteReview(String id) {
        if (!reviewRepository.existsById(id)) {
            throw new IllegalArgumentException("Review không tồn tại để xóa: " + id);
        }
        reviewRepository.deleteById(id);
    }
}
