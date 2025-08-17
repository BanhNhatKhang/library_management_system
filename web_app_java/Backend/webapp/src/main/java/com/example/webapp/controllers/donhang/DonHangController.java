package com.example.webapp.controllers;

import com.example.webapp.models.DonHang;
import com.example.webapp.services.DonHangService;
import com.example.webapp.dto.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@RestController
@RequestMapping("/api/donhang")
public class DonHangController {

    @Autowired
    private DonHangService donHangService;

    private DonHang convertToDonHangEntity(DonHangDTO donHangDTO) {
        DonHang donHang = new DonHang();
        donHang.setMaDonHang(donHangDTO.getMaDonHang());
        donHang.setNgayDat(donHangDTO.getNgayDat());
        donHang.setTongTien(donHangDTO.getTongTien());
        donHang.setTrangThai(donHangDTO.getTrangThaiDonHang());
        return donHang;

    }

    @GetMapping
    public List<DonHang> getAllDonHang() {
        return donHangService.getAllDonHang();
    }

    @GetMapping("/id/{maDonHang}")
    public DonHang getDonHangById(@PathVariable String maDonHang) {
        return donHangService.getDonHangById(maDonHang)
                .orElseThrow(() -> new RuntimeException("không tìm thấy mã đơn hàng với mã: " + maDonHang));
    }

    @GetMapping("/sdt/{dienThoai}")
    public List<DonHang> getDonHangByDienThoai(@PathVariable String dienThoai) {
        return donHangService.getDonHangByDienThoai(dienThoai);
    }

    @GetMapping("/ten")
    public List<DonHang> getDonHangByTenDocGia(@RequestParam String hoLot, @RequestParam String ten) {
        return donHangService.getDonHangByTenDocGia(hoLot,ten);
    }

    @PostMapping
    public DonHang createDonHang(@RequestBody DonHangRequestDTO request) {
        DonHang donHang = convertToDonHangEntity(request.getDonHang());
        return donHangService.saveDonHang(donHang, request.getMaDocGia(), request.getMaUuDaiList());
    }

    @PutMapping("/{maDonHang}")
    public DonHang updateDonHang(@PathVariable String maDonHang, @RequestBody DonHang donHang) {
        return donHangService.updateDonHang(maDonHang, donHang);
    }

    @DeleteMapping("/{maDonHang}")
    public String deleteDonHang(@PathVariable String maDonHang) {
        donHangService.deleteDonHang(maDonHang);
        return "Đơn hàng với ID " + maDonHang + " đã được xóa thành công";
    }
}