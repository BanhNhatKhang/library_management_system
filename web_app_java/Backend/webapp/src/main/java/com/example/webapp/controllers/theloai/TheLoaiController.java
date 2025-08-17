package com.example.webapp.controllers;

import com.example.webapp.models.TheLoai;
import com.example.webapp.services.TheLoaiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theloai")
public class TheLoaiController {
    @Autowired
    private TheLoaiService theLoaiService;

    @GetMapping
    public List<TheLoai> getAllTheLoai() {
        return theLoaiService.getAllTheLoai();
    }

    @GetMapping("/{maTheLoai}")
    public TheLoai getTheLoaiById(@PathVariable String maTheLoai) {
        return theLoaiService.getTheLoaiById(maTheLoai)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thể loại với mã: " + maTheLoai));
    }

    @PostMapping
    public TheLoai createTheLoai(@RequestBody TheLoai theLoai) {
        return theLoaiService.saveTheLoai(theLoai);
    }

    @PutMapping("/{maTheLoai}")
    public TheLoai updateTheLoai(@PathVariable String maTheLoai, @RequestBody TheLoai theLoai) {
        return theLoaiService.updateTheLoai(maTheLoai, theLoai);
    }

    @DeleteMapping("/{maTheLoai}")
    public String deleteTheLoai(@PathVariable String maTheLoai) {
        theLoaiService.deleteTheLoai(maTheLoai);
        return "Thể loại với mã " + maTheLoai + " đã được xóa thành công";
    }
}