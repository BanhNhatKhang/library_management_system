package com.example.webapp.controllers;

import org.springframework.web.bind.annotation.*;
import com.example.webapp.dto.Promotion;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @GetMapping
    public String getPromotion() {
        return "Đây là chương trình khuyến mãi";
    }

    @PostMapping
    public String createPromotion(@RequestBody Promotion promotion) {
        return "khuyến mãi đã được tạo thành công";
    }

    @PutMapping("/{PromotionId}")
    public String updatePromotion(@PathVariable String PromotionId, @RequestBody Promotion promotion) {
        return "khuyến mãi với ID  đã được cập nhật thành công";
    }

    @DeleteMapping("/{PromotionId}")
    public String deletePromotion(@PathVariable String PromotionId) {
        return "khuyến mãi với ID  đã được xóa thành công";
    }

}