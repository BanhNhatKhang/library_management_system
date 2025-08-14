package com.example.webapp.controllers;

import org.springframework.web.bind.annotation.*;
import com.example.webapp.dto.Order;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping
    public String getOrder() {
        return "Đây là thông tin đơn hàng";
    }

    @PostMapping
    public String createOrder(@RequestBody Order order) {
        return "Đơn hàng đã được tạo thành công";
    }

    @PutMapping("/{orderId}")
    public String updateOrder(@PathVariable String orderId, @RequestBody Order order) {
        return "Đơn hàng với ID " + orderId + " đã được cập nhật thành công";
    }

    @DeleteMapping("/{orderId}")
    public String deleteOrder(@PathVariable String orderId) {
        return "Đơn hàng với ID " + orderId + " đã được xóa thành công";
    }
}