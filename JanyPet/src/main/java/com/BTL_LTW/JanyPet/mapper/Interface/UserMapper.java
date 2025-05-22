package com.BTL_LTW.JanyPet.mapper.Interface;

import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.GenericMapper;

import java.util.List;

public interface UserMapper extends GenericMapper<User, UserResponse, UserCreationRequest, UserUpdateRequest> {
    //List<UserResponse> toDTOList(List<User> entities);
}
