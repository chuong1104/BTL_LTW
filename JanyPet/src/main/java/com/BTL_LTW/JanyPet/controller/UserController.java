package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.dto.request.UserCreationRequest;
import com.BTL_LTW.JanyPet.dto.request.UserUpdateRequest;
import com.BTL_LTW.JanyPet.dto.response.UserResponse;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.UserService;
import com.BTL_LTW.JanyPet.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;
    @Autowired
    private UserRepository userRepository;


    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Tạo mới người dùng - chỉ admin mới có quyền
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@RequestBody UserCreationRequest request) {
        // Hàm createUser đã được mã hóa password trong mapper, tránh double encoding
        User user = userService.createUser(request);
        // Sau khi tạo, trả về DTO từ user vừa tạo dựa trên ID (nếu cần lấy thêm thông tin từ DB)
        UserResponse response = userService.getUserById(user.getId());
        return ResponseEntity.ok(response);
    }

    // Lấy ra danh sách người dùng - chỉ admin mới có quyền
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsers() {
        List<UserResponse> users = userService.getUsers();
        return ResponseEntity.ok(users);
    }

    // Lấy ra thông tin người dùng dựa trên Id
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserResponse> getUser(@PathVariable("id") String id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    // Lấy thông tin người dùng hiện tại
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        try {
            User currentUser = SecurityUtils.getCurrentUser(userRepository);
            // Use the user...
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving user profile: " + e.getMessage());
        }
    }

    // Cập nhật thông tin người dùng
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserResponse> updateUser(@PathVariable("id") String id, @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    // Xóa người dùng - chỉ admin mới có quyền
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> softDeleteUser(@PathVariable("id") String id) {
        userService.softDeleteUser(id);
        return ResponseEntity.ok("Người dùng đã bị vô hiệu hóa!");
    }

    // Khóa/mở khóa tài khoản người dùng - chỉ admin mới có quyền
    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> toggleLockUser(@PathVariable("id") String id, @RequestParam boolean locked) {
        userService.toggleLockUser(id, locked);
        String message = locked ? "Tài khoản đã bị khóa" : "Tài khoản đã được mở khóa";
        return ResponseEntity.ok(message);
    }
}
