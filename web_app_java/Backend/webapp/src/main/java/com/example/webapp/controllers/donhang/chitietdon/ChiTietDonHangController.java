package com.example.webapp.controllers.donhang.chitietdon;

import com.example.webapp.dto.ChiTietDonHangDTO;
import com.example.webapp.models.ChiTietDonHang;
import com.example.webapp.models.ChiTietDonHangId;
import com.example.webapp.services.ChiTietDonHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chitietdonhang")
public class ChiTietDonHangController {

    @Autowired
    private ChiTietDonHangService chiTietDonHangService;

    @GetMapping
    public List<ChiTietDonHangDTO> getAllChiTietDonHang() {
        return chiTietDonHangService.getAllChiTietDonHang();
    }

    @GetMapping("/{maDonHang}/{maSach}")
    public Optional<ChiTietDonHangDTO> getChiTietDonHangById(
            @PathVariable String maDonHang,
            @PathVariable String maSach) {
        ChiTietDonHangId id = new ChiTietDonHangId(maDonHang, maSach);
        return chiTietDonHangService.getChiTietDonHangById(id);
    }

    @GetMapping("/donhang/{maDonHang}")
    public List<ChiTietDonHangDTO> getChiTietByMaDonHang(@PathVariable String maDonHang) {
        return chiTietDonHangService.getChiTietByMaDonHang(maDonHang);
    }

    @GetMapping("/sach/{maSach}")
    public List<ChiTietDonHangDTO> getChiTietByMaSach(@PathVariable String maSach) {
        return chiTietDonHangService.getChiTietByMaSach(maSach);
    }

    @GetMapping("/tongtien/{maDonHang}")
    public ChiTietDonHangDTO getTongTienByMaDonHang(@PathVariable String maDonHang) {
        return chiTietDonHangService.getTongTienByMaDonHang(maDonHang);
    }

    @GetMapping("/topsach")
    public List<ChiTietDonHangDTO> getTopSachBanChay() {
        return chiTietDonHangService.getTopSachBanChay();
    }


    @PostMapping
    public ChiTietDonHangDTO createChiTietDonHang(@RequestBody ChiTietDonHangDTO chiTietDonHangDTO) {
        return chiTietDonHangService.saveChiTietDonHang(chiTietDonHangDTO);
    }

    @PutMapping("/{maDonHang}/{maSach}")
    public ChiTietDonHang updateChiTietDonHang(
            @PathVariable String maDonHang,
            @PathVariable String maSach,
            @RequestBody ChiTietDonHang chiTietDonHang) {
        ChiTietDonHangId id = new ChiTietDonHangId(maDonHang, maSach);
        return chiTietDonHangService.updateChiTietDonHang(id, chiTietDonHang);
    }

    @DeleteMapping("/{maDonHang}/{maSach}")
    public String deleteChiTietDonHang(@PathVariable String maDonHang, @PathVariable String maSach) {
        ChiTietDonHangId id = new ChiTietDonHangId(maDonHang, maSach);
        chiTietDonHangService.deleteChiTietDonHang(id);
        return "Xóa chi tiết đơn hàng thành công";
    }
}
