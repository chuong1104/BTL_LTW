package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.dto.request.LoginRequest;
import com.BTL_LTW.JanyPet.dto.request.RegisterRequest;
import com.BTL_LTW.JanyPet.dto.request.RefreshTokenRequest;
import com.BTL_LTW.JanyPet.dto.response.JwtResponse;
import com.BTL_LTW.JanyPet.dto.response.MessageResponse;
import com.BTL_LTW.JanyPet.dto.response.TokenRefreshResponse;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.security.JwtService;
import com.BTL_LTW.JanyPet.service.Interface.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
//@CrossOrigin(origins = {"http://127.0.0.1:5500"}, allowCredentials = "true")
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

        // Đăng ký người dùng mới với vai trò CUSTOMER
        User created = userService.registerUser(
                req.getUsername(),
                req.getEmail(),
                req.getPhoneNumber(),
                req.getPassword(),
                Role.CUSTOMER  // Mặc định là CUSTOMER khi đăng ký
        );

        return ResponseEntity.ok(new MessageResponse("Đăng ký thành công"));
    }

    @PostMapping("/register-admin")
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterRequest req) {
         //Kiểm tra mật khẩu và xác nhận mật khẩu
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

        User created = userService.registerUser(
                req.getUsername(),
                req.getEmail(),
                req.getPhoneNumber(),
                req.getPassword(),

                Role.ADMIN
        );

        return ResponseEntity.ok(new MessageResponse("Tạo tài khoản admin thành công"));
    }

    @PostMapping("/register-employee")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> registerEmployee(@RequestBody RegisterRequest req) {
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

        User created = userService.registerUser(
                req.getUsername(),
                req.getEmail(),
                req.getPhoneNumber(),
                req.getPassword(),
                Role.EMPLOYEE
        );

        return ResponseEntity.ok(new MessageResponse("Tạo tài khoản nhân viên thành công"));
    }


    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            User userDetails = (User) authentication.getPrincipal();

            // Kiểm tra xem tài khoản có bị khóa không
            if (!userDetails.isEnabled()) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Tài khoản đã bị khóa"));
            }

            // Kiểm tra vai trò: không cho phép ADMIN đăng nhập qua /login
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            if (roles.contains("ADMIN")) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Tài khoản admin không được phép đăng nhập tại đây. Vui lòng sử dụng /login-admin"));
            }

            String jwt = jwtService.generateToken(authentication);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            Long tokenExpiry = jwtService.getExpirationFromToken(jwt).getTime();

            // Lưu refresh token
            userService.saveRefreshToken(userDetails.getId(), refreshToken, tokenExpiry);

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    refreshToken,
                    tokenExpiry,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    userDetails.getPhoneNumber(),
                    roles
            ));
        } catch (DisabledException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Tài khoản đã bị khóa"));
        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Sai tên đăng nhập hoặc mật khẩu"));
        }
    }

    @PostMapping("/login-admin")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            User userDetails = (User) authentication.getPrincipal();

            // Kiểm tra xem tài khoản có bị khóa không
            if (!userDetails.isEnabled()) {
                return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Tài khoản đã bị khóa"));
            }

            String jwt = jwtService.generateToken(authentication);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            Long tokenExpiry = jwtService.getExpirationFromToken(jwt).getTime();

            // Lưu refresh token
            userService.saveRefreshToken(userDetails.getId(), refreshToken, tokenExpiry);

            List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(
                jwt,
                refreshToken,
                tokenExpiry,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getPhoneNumber(),
                roles
            ));
        } catch (DisabledException e) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new MessageResponse("Tài khoản đã bị khóa"));
        } catch (BadCredentialsException e) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("Sai tên đăng nhập hoặc mật khẩu"));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            String newToken = jwtService.refreshToken(request.getRefreshToken());
            Long tokenExpiry = jwtService.getExpirationFromToken(newToken).getTime();

            return ResponseEntity.ok(new TokenRefreshResponse(newToken, tokenExpiry));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("Invalid refresh token: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        // Simply invalidate the session if needed
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công"));
    }
}
