package com.example.webapp.controllers.donhang.tongquatdon;

import com.example.webapp.models.DonHang;
import com.example.webapp.services.DonHangService;
import com.example.webapp.dto.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/{maDonHang}/chitiet")
    public ResponseEntity<List<ChiTietDonHangDTO>> getChiTietDonHang(@PathVariable String maDonHang) {
        try {
            List<ChiTietDonHangDTO> chiTietList = donHangService.getChiTietDonHang(maDonHang);
            return ResponseEntity.ok(chiTietList);
        } catch (Exception e) {
            System.err.println("❌ Error getting chi tiet don hang: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/sdt/{dienThoai}")
    public ResponseEntity<List<DonHangDTO>> getDonHangBySoDienThoai(@PathVariable String dienThoai) {
        try {
            List<DonHangDTO> donHangList = donHangService.getDonHangBySoDienThoai(dienThoai);
            
            // Xử lý tên sách trong service đã đủ, không cần làm gì thêm ở đây
            System.out.println("✅ Trả về " + donHangList.size() + " đơn hàng cho SĐT: " + dienThoai);
            
            return ResponseEntity.ok(donHangList);
        } catch (Exception e) {
            System.err.println("❌ Error getting orders by phone: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
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

    @PostMapping("/{maDonHang}/apply-uudai")
    public ResponseEntity<?> applyUuDai(
            @PathVariable String maDonHang,
            @RequestParam String maUuDai) {
        try {
            // Kiểm tra xung đột trước
            String conflictMessage = donHangService.validateUuDaiConflict(maDonHang, maUuDai);
            if (conflictMessage != null) {
                return ResponseEntity.ok().body(Map.of(
                    "warning", conflictMessage,
                    "canProceed", true
                ));
            }
            
            // Tính toán và áp dụng ưu đãi tốt nhất
            DonHangDTO result = donHangService.calculateBestDiscount(maDonHang, maUuDai);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}