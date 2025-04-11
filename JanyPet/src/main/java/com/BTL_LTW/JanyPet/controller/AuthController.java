package com.BTL_LTW.JanyPet.controller;

import com.BTL_LTW.JanyPet.common.Role;
import com.BTL_LTW.JanyPet.dto.request.LoginRequest;
import com.BTL_LTW.JanyPet.dto.request.RegisterRequest;
import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.security.JwtService;
import com.BTL_LTW.JanyPet.service.Interface.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
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
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            return ResponseEntity
                    .badRequest()
                    .body("Mật khẩu và xác nhận mật khẩu không khớp");
        }
        User created = userService.registerUser(
                req.getUserName(),
                req.getEmail(),
                req.getPhoneNumber(),
                req.getPassword(),
                Role.CUSTOMER
        );
        return ResponseEntity.ok(created);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        req.getPhoneNumber(),
                        req.getPassword()
                )
        );
        String token = jwtService.generateToken(auth);
        return ResponseEntity.ok(token);
    }
}
