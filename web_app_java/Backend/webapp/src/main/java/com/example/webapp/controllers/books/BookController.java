package com.example.webapp.controllers;

import org.springframework.web.bind.annotation.*;
import com.example.webapp.dto.Book;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @GetMapping
    public String getBook() {
        return "Đây là sách";
    }

    @PostMapping
    public String createBook(@RequestBody Book book) {
        return "Sách đã được tạo thành công";
    }

    @PutMapping("/{maSach}")
    public String updateBook(@PathVariable String maSach, @RequestBody Book book) {
        return "Sách với mã " + maSach + " đã được cập nhật thành công";
    }

    @DeleteMapping("/{maSach}")
    public String deleteBook(@PathVariable String maSach) {
        return "Sách với mã " + maSach + " đã được xóa thành công";
    }


}