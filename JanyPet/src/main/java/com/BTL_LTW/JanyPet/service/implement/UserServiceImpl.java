package com.BTL_LTW.JanyPet.service.implement;

import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.mapper.Implement.UserMapperImpl;
import com.BTL_LTW.JanyPet.mapper.Interface.UserMapper;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, UserMapperImpl userMapperImpl, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapperImpl;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User createUser(UserCreationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }

        User user = userMapper.toEntity(request); // đã encode password trong mapper
        return userRepository.save(user);
    }

    @Override
    public List<UserResponse> getUsers() {
        return userRepository.findActiveUsers().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(String id) {
        return userMapper.toDTO(userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng")));
    }

    @Override
    public UserResponse getCurrentUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new UsernameNotFoundException("No authenticated user found");
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof User) {
            // Principal is now directly a User entity
            User user = (User) principal;
            return userMapper.toDTO(user);
        } else if (principal instanceof String) {
            // This case handles when the principal is a username string
            String username = (String) principal;
            User user = userRepository.findByEmail(username)
                    .orElseGet(() -> userRepository.findByPhoneNumber(username)
                            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username)));
            return userMapper.toDTO(user);
        }

        throw new UsernameNotFoundException("Unexpected principal type: " + principal.getClass());
    }

    @Override
    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber())
                && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }

        userMapper.updateEntity(user, request);

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return userMapper.toDTO(userRepository.save(user));
    }

    @Transactional
    public void softDeleteUser(String id) {
        userRepository.softDeleteUser(id);
    }

    @Override
    public User registerUser(String userName, String email, String phoneNumber, String password, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }

        User u = new User();
        u.setUsername(userName);
        u.setEmail(email);
        u.setPhoneNumber(phoneNumber);
        u.setPassword(passwordEncoder.encode(password));
        u.setRole(role);
        u.setVerified(true);

        return userRepository.save(u);
    }

    @Override
    public User findByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByPhoneNumber(String phoneNumber) {
        return userRepository.existsByPhoneNumber(phoneNumber);
    }

    @Override
    public void saveRefreshToken(String userId, String refreshToken, Long tokenExpiry) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRefreshToken(refreshToken);
        user.setTokenExpiry(tokenExpiry);
        userRepository.save(user);
    }

    @Override
    public void clearRefreshToken(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRefreshToken(null);
        user.setTokenExpiry(null);
        userRepository.save(user);
    }

    @Override
    public User findByRefreshToken(String refreshToken) {
        return userRepository.findByRefreshToken(refreshToken)
            .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
    }

    @Override
    public void toggleLockUser(String id, boolean locked) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setLocked(locked);
        userRepository.save(user);
    }

    @Override
    public boolean existsAdminUser() {
        return false;
    }
}
