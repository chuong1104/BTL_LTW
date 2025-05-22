package com.BTL_LTW.JanyPet.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.access.prepost.PreAuthorize;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index.html";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ROLE_ADMIN')")  // Thêm ROLE_ prefix
    public String admin() {
        return "admin.html";
    }

    @GetMapping("/login")
    public String login() {
        return "login.html";
    }
}