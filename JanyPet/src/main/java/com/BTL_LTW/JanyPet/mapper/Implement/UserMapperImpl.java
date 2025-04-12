package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.Interface.UserMapper;
import org.springframework.stereotype.Component;

@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toDTO(User entity) {
        if (entity == null) return null;

        return new UserResponse(
                entity.getId(),
                entity.getUsername(), // Chuyển `username` thành `name`
                entity.getRole(),
                entity.getEmail(),
                entity.getGender() != null ? entity.getGender().name() : null,
                entity.getAddress(),
                entity.getPhoneNumber(),
                entity.getVerified(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    @Override
    public User toEntity(UserCreationRequest creationDTO) {
        if (creationDTO == null) return null;

        User user = new User();
        user.setUsername(creationDTO.getUsername()); // Chuyển `name` thành `username`
        user.setEmail(creationDTO.getEmail());
        user.setRole(creationDTO.getRole());
        user.setPassword(creationDTO.getPassword());
        user.setGender(creationDTO.getGender());
        user.setAddress(creationDTO.getAddress());
        user.setPhoneNumber(creationDTO.getPhoneNumber());
        user.setVerified(false); // Mặc định khi tạo tài khoản chưa xác minh

        return user;
    }

    @Override
    public void updateEntity(User entity, UserUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) return;

        if (updateDTO.getEmail()!=null) entity.setEmail(updateDTO.getEmail());
        if (updateDTO.getUsername() != null) entity.setUsername(updateDTO.getUsername());
        if (updateDTO.getAddress() != null) entity.setAddress(updateDTO.getAddress());
        if (updateDTO.getPhoneNumber() != null) entity.setPhoneNumber(updateDTO.getPhoneNumber());
        if (updateDTO.getActive() != null) entity.setActive(updateDTO.getActive());
    }
}
