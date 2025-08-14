package com.example.webapp.controllers;

import com.example.webapp.dto.Register;
import com.example.webapp.dto.Login;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping
    public String testAuth() {
        return "đây là trang chứng thực";
    }

    @PostMapping("/register")
    public String register(@RequestBody Register register) {
        
        return "Đăng ký thành công ";
    }

    @PostMapping("/login")
    public String login(@RequestBody Login login) {
        
        return "Đăng nhập thành công";
    }
}