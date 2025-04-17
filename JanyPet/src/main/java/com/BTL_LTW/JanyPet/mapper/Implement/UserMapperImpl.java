package com.BTL_LTW.JanyPet.mapper.Implement;

import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.Interface.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserMapperImpl implements UserMapper {

    // Nếu muốn mã hóa mật khẩu ngay khi mapping, hãy tiêm PasswordEncoder
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserResponse toDTO(User entity) {
        if (entity == null) return null;

        return new UserResponse(
                entity.getUsername(),
                entity.getRole(),
                entity.getEmail(),
                entity.getGender(),
                entity.getAddress(),
                entity.getPhoneNumber(),
                entity.getVerified(),
                entity.getCreatedAt(), // Giả sử BaseEntity cung cấp getCreatedAt()
                entity.getUpdatedAt()  // Giả sử BaseEntity cung cấp getUpdatedAt()
        );
    }

    @Override
    public User toEntity(UserCreationRequest creationDTO) {
        if (creationDTO == null) return null;

        User user = new User();
        user.setUsername(creationDTO.getUsername());
        user.setEmail(creationDTO.getEmail());
        user.setRole(creationDTO.getRole());
        // Mã hóa mật khẩu trước khi lưu (nếu chưa được mã hóa từ Controller)
        user.setPassword(passwordEncoder.encode(creationDTO.getPassword()));
        user.setGender(creationDTO.getGender());
        user.setAddress(creationDTO.getAddress());
        user.setPhoneNumber(creationDTO.getPhoneNumber());
        user.setVerified(false); // Mặc định: tài khoản chưa được xác thực
        // Các trường khác (createdAt, updatedAt) sẽ được thiết lập qua BaseEntity (nếu có)

        return user;
    }

    @Override
    public void updateEntity(User entity, UserUpdateRequest updateDTO) {
        if (entity == null || updateDTO == null) return;

        if (updateDTO.getEmail() != null)
            entity.setEmail(updateDTO.getEmail());
        if (updateDTO.getUsername() != null)
            entity.setUsername(updateDTO.getUsername());
        if (updateDTO.getAddress() != null)
            entity.setAddress(updateDTO.getAddress());
        if (updateDTO.getPhoneNumber() != null)
            entity.setPhoneNumber(updateDTO.getPhoneNumber());
        // Nếu có các trường cập nhật khác, bổ sung tại đây.
    }
}
