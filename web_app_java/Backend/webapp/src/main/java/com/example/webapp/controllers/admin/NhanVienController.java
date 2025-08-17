package com.example.webapp.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.models.NhanVien;
import com.example.webapp.services.NhanVienService;

import java.util.List;

@RestController
@RequestMapping("/api/nhanvien")
public class NhanVienController {

    @Autowired
    private NhanVienService nhanVienService;

    @GetMapping
    public List<NhanVien> getAllNhanVien() {
        return nhanVienService.getAllNhanVien();
    }

    @GetMapping("/{maNhanVien}")
    public NhanVien getNhanVienById(@PathVariable String maNhanVien) {
        return nhanVienService.getNhanVienById(maNhanVien)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với mã: " + maNhanVien));
    }

    @PostMapping
    public NhanVien createNhanVien(@RequestBody NhanVien nhanVien) {
        return nhanVienService.saveNhanVien(nhanVien);
    }

    @PutMapping("/{maNhanVien}")
    public NhanVien updateNhanVien(@PathVariable String maNhanVien, @RequestBody NhanVien nhanVien) {
        return nhanVienService.updateNhanVien(maNhanVien, nhanVien);
    }

    @DeleteMapping("/{maNhanVien}")
    public String deleteNhanVien(@PathVariable String maNhanVien) {
        nhanVienService.deleteNhanVien(maNhanVien);
        return "Nhân viên với mã " + maNhanVien + " đã được xóa thành công";
    }
}