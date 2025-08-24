package com.example.webapp.controllers.admin;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.models.NhanVien;
import com.example.webapp.dto.*;
import com.example.webapp.services.NhanVienService;

import java.util.List;

@RestController
@RequestMapping("/api/nhanvien")
public class NhanVienController {

    @Autowired
    private NhanVienService nhanVienService;

    @GetMapping
    public List<NhanVienDTO> getAllNhanVien() {
        return nhanVienService.getAllNhanVien();
    }

    @GetMapping("/{maNhanVien}")
    public NhanVienDTO getNhanVienById(@PathVariable String maNhanVien) {
        return nhanVienService.getNhanVienById(maNhanVien)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với mã: " + maNhanVien));
    }

    @PostMapping
    public NhanVien createNhanVien(@RequestBody NhanVienDangKyDTO nhanVienDangKyDTO) {
        NhanVien nhanVien = nhanVienService.toEntity(nhanVienDangKyDTO);
        return nhanVienService.saveNhanVien(nhanVien);
    }

    @PutMapping("/{maNhanVien}")
    public NhanVien updateNhanVien(@PathVariable String maNhanVien, @RequestBody NhanVienDTO nhanVienDTO) {
        NhanVien nhanVien = nhanVienService.toEntity(nhanVienDTO);
        return nhanVienService.updateNhanVien(maNhanVien, nhanVien);
    }

    @DeleteMapping("/{maNhanVien}")
    public String deleteNhanVien(@PathVariable String maNhanVien) {
        nhanVienService.deleteNhanVien(maNhanVien);
        return "Nhân viên với mã " + maNhanVien + " đã được xóa thành công";
    }
}