package com.example.webapp.controllers.donhang.chitietdon;

import com.example.webapp.dto.ChiTietDonHangDTO;
import com.example.webapp.models.ChiTietDonHang;
import com.example.webapp.models.ChiTietDonHangId;
import com.example.webapp.services.ChiTietDonHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
// import java.util.Optional;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/chitietdonhang")
public class ChiTietDonHangController {

    @Autowired
    private ChiTietDonHangService chiTietDonHangService;

    @GetMapping
    public List<ChiTietDonHangDTO> getAllChiTietDonHang() {
        return chiTietDonHangService.getAllChiTietDonHang();
    }

    @GetMapping("/donhang/{maDonHang}")
    public List<ChiTietDonHangDTO> getChiTietByMaDonHang(@PathVariable String maDonHang) {
        return chiTietDonHangService.getChiTietByMaDonHang(maDonHang);
    }

    @GetMapping("/id/{maDonHang}/{maSach}")
    public ChiTietDonHangDTO getChiTietById(@PathVariable String maDonHang, @PathVariable String maSach) {
        ChiTietDonHangId id = new ChiTietDonHangId(maDonHang, maSach);
        return chiTietDonHangService.getChiTietById(id);
    }

    @GetMapping("/tongtien/{maDonHang}")
    public BigDecimal getTongTienByMaDonHang(@PathVariable String maDonHang) {
        return chiTietDonHangService.getTongTienByMaDonHang(maDonHang);
    }

    @GetMapping("/tongsoluong/{maDonHang}")
    public Long getTongSoLuongByMaDonHang(@PathVariable String maDonHang) {
        return chiTietDonHangService.getTongSoLuongByMaDonHang(maDonHang);
    }

    @PostMapping
    public ChiTietDonHangDTO addChiTietDonHang(@RequestBody ChiTietDonHang chiTiet) {
        return chiTietDonHangService.addChiTietDonHang(chiTiet);
    }

    @PutMapping
    public ChiTietDonHangDTO updateChiTietDonHang(@RequestBody ChiTietDonHang chiTiet) {
        return chiTietDonHangService.updateChiTietDonHang(chiTiet);
    }

    @DeleteMapping("/{maDonHang}/{maSach}")
    public void deleteChiTietDonHang(@PathVariable String maDonHang, @PathVariable String maSach) {
        ChiTietDonHangId id = new ChiTietDonHangId(maDonHang, maSach);
        chiTietDonHangService.deleteChiTietDonHang(id);
    }
}
