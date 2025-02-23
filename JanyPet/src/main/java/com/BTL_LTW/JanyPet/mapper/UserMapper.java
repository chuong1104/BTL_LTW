package com.BTL_LTW.JanyPet.mapper;

import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.respone.UserResponse;
import com.BTL_LTW.JanyPet.entity.User;

public interface UserMapper extends GenericMapper<User, UserResponse, UserCreationRequest, UserUpdateRequest> {
}
