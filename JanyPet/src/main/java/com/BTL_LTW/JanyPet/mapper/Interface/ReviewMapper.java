package com.BTL_LTW.JanyPet.mapper.Interface;

import com.BTL_LTW.JanyPet.dto.request.ReviewCreateRequest;
import com.BTL_LTW.JanyPet.dto.request.ReviewUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.ReviewResponse;
import com.BTL_LTW.JanyPet.entity.Review;
import com.BTL_LTW.JanyPet.mapper.GenericMapper;

public interface ReviewMapper extends GenericMapper<Review, ReviewResponse, ReviewCreateRequest, ReviewUpdateRequest> {
    // Có thể thêm hàm phụ nếu cần sau này
}
