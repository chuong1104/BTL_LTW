package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;
import com.BTL_LTW.JanyPet.entity.User;

import java.util.List;

public interface UserService {
    User createUser(UserCreationRequest request);
    List<UserResponse> getUsers();
    UserResponse getUserById(String id);

    // cap nhat thong tin nguoi dung qua id
    UserResponse updateUser(String id, UserUpdateRequest request);
    User registerUser(String userName, String email, String phoneNumber, String password, Role role);
    User findByPhoneNumber(String phoneNumber);
}
