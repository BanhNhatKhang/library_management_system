package com.example.webapp.controllers.donhang.tongquatdon;

import com.example.webapp.models.DonHang;
import com.example.webapp.services.DonHangService;
import com.example.webapp.dto.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.dto.ThanhToanRequestDTO;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/donhang")
public class DonHangController {

    @Autowired
    private DonHangService donHangService;

    @GetMapping
    public List<DonHangDTO> getAllDonHang() {
        return donHangService.getAllDonHang();
    }

    @GetMapping("/id/{maDonHang}")
    public DonHangDTO getDonHangById(@PathVariable String maDonHang) {
        return donHangService.getDonHangById(maDonHang)
                .orElseThrow(() -> new RuntimeException("không tìm thấy mã đơn hàng với mã: " + maDonHang));
    }

    @GetMapping("/sdt/{dienThoai}")
    public List<DonHangDTO> getDonHangByDienThoai(@PathVariable String dienThoai) {
        return donHangService.getDonHangByDienThoai(dienThoai);
    }

    @GetMapping("/ten")
    public List<DonHangDTO> getDonHangByTenDocGia(@RequestParam String hoLot, @RequestParam String ten) {
        return donHangService.getDonHangByTenDocGia(hoLot,ten);
    }

    @PostMapping
    public DonHang createDonHang(@RequestBody DonHangRequestDTO request) {
        DonHang donHang = donHangService.toEntity(request.getDonHang());
        return donHangService.saveDonHang(donHang, request.getMaDocGia(), request.getMaUuDaiList());
    }

    @PostMapping("/thanhtoan")
    public DonHangDTO thanhToan(Principal principal, @RequestBody ThanhToanRequestDTO request) {
        return donHangService.thanhToan(principal, request);
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