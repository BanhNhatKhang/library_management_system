package com.example.webapp.controllers;

import org.springframework.web.bind.annotation.*;
import com.example.webapp.dto.Cart;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @GetMapping
    public String getCart() {
        return "Đây là giỏ hàng";
    }

    @PostMapping
    public String createCart(@RequestBody Cart cart) {
        return "Giỏ hàng đã được tạo thành công";
    }
    
    @PutMapping("/{cartid}")
    public String updateCart(@PathVariable String cartid, @RequestBody Cart cart) {
        return "Giỏ hàng với ID " + cartid + " đã được cập nhật thành công";
    }

    @DeleteMapping("/{cartid}")
    public String deleteCart(@PathVariable String cartid) {
        return "Giỏ hàng với ID " + cartid + " đã được xóa thành công";
    }

}