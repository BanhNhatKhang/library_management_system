package com.example.webapp.controllers;

import org.springframework.web.bind.annotation.*;
import com.example.webapp.dto.Messages;

@RestController
@RequestMapping("/api/home")
public class HomeController {
    @GetMapping
    public Messages home() {
        return new Messages("Chào mừng bạn đến với trang chủ!");
    }
}