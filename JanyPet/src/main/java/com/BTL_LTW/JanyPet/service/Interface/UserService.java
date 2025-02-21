package com.BTL_LTW.JanyPet.service.Interface;

import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.respone.UserRespone;
import com.BTL_LTW.JanyPet.entity.user;

import java.util.List;

public interface UserService {
    user createUser(UserCreationRequest request);
    List<UserRespone> getUsers();
    UserRespone getUser(String id);

    void deleteUser(String userId);
}
