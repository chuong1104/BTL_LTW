package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.ReviewCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.ReviewUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(ReviewCreateRequest request);
    List<ReviewResponse> getAllReviews();
    ReviewResponse getReviewById(String id);
    ReviewResponse updateReview(String id, ReviewUpdateRequest request);
    void deleteReview(String id);
}
