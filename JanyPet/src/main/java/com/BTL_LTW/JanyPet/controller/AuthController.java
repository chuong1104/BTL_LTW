package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.dto.request.LoginRequest;
import com.BTL_LTW.JanyPet.dto.request.RegisterRequest;
import com.BTL_LTW.JanyPet.dto.response.JwtResponse;
import com.BTL_LTW.JanyPet.dto.response.MessageResponse;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.security.JwtService;
import com.BTL_LTW.JanyPet.service.Interface.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://127.0.0.1:5500"}, allowCredentials = "true")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthController(UserService userService,
                          AuthenticationManager authManager,
                          JwtService jwtService) {
        this.userService = userService;
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        // Kiểm tra mật khẩu và xác nhận mật khẩu
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Mật khẩu và xác nhận mật khẩu không khớp"));
        }

        // Kiểm tra email đã tồn tại chưa
        if (userService.existsByEmail(req.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Email đã được sử dụng"));
        }

        // Kiểm tra số điện thoại đã tồn tại chưa
        if (userService.existsByPhoneNumber(req.getPhoneNumber())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Số điện thoại đã được sử dụng"));
        }

//        // Đăng ký người dùng mới
        User created = userService.registerUser(
                req.getUsername(),
                req.getEmail(),
                req.getPhoneNumber(),
                req.getPassword(),
                Role.CUSTOMER
        );

        return ResponseEntity.ok(new MessageResponse("Đăng ký thành công"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        // Xác thực người dùng
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getUsername(),
                        req.getPassword()
                )
        );

        // Tạo JWT token
        String token = jwtService.generateToken(auth);

        // Lấy thông tin người dùng
        User userDetails = (User) auth.getPrincipal();

        // Lấy danh sách quyền
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // Tạo refresh token và lưu vào database
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        userService.saveRefreshToken(userDetails.getId(), refreshToken);

        // Trả về thông tin đăng nhập
        return ResponseEntity.ok(new JwtResponse(
                token,
                refreshToken,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getPhoneNumber(),
                roles
        ));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody String refreshToken) {
        return ResponseEntity.ok(jwtService.refreshToken(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String userId = jwtService.getUserIdFromToken(jwt);
        userService.clearRefreshToken(userId);
        return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công"));
    }
}
