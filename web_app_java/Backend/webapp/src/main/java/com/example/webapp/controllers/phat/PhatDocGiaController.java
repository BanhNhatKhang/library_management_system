package com.example.webapp.controllers.phat;

import com.example.webapp.models.DocGia;
import com.example.webapp.models.PhatDocGia;
import com.example.webapp.models.TheoDoiMuonSach;
import com.example.webapp.models.TheoDoiMuonSachId;
import com.example.webapp.services.PhatDocGiaService;
import com.example.webapp.services.DocGiaService;
import com.example.webapp.services.TheoDoiMuonSachService;
import com.example.webapp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
// import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletRequest;
import com.example.webapp.dto.PhatDocGiaDTO;

@RestController
@RequestMapping("/api/phat")
public class PhatDocGiaController {

    private static final Logger logger = LoggerFactory.getLogger(PhatDocGiaController.class);

    @Autowired
    private PhatDocGiaService phatDocGiaService;

    @Autowired
    private DocGiaService docGiaService;

    @Autowired
    private TheoDoiMuonSachService theoDoiMuonSachService;

    /**
     * Lấy maDocGia từ JWT token trong request header
     */
    private String getMaDocGiaFromToken(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String email = JwtUtil.getUsernameFromToken(token);
                
                // Lấy DocGia từ email
                DocGia docGia = docGiaService.findByEmail(email);
                return docGia.getMaDocGia();
            }
            throw new RuntimeException("Không tìm thấy token xác thực");
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xác thực: " + e.getMessage());
        }
    }

    @GetMapping("/docgia/me")
    public ResponseEntity<List<PhatDocGia>> getMyFines(HttpServletRequest request) {
        try {
            String maDocGia = getMaDocGiaFromToken(request);
            List<PhatDocGia> fines = phatDocGiaService.getFinesByDocGia(maDocGia);
            return ResponseEntity.ok(fines);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/docgia/me/total")
    public ResponseEntity<Map<String, Object>> getTotalUnpaidFines(HttpServletRequest request) {
        try {
            String maDocGia = getMaDocGiaFromToken(request);
            BigDecimal total = phatDocGiaService.getTotalUnpaidFines(maDocGia);
            
            Map<String, Object> response = Map.of(
                "totalUnpaidFines", total,
                "formattedAmount", String.format("%,.0f VND", total.doubleValue()),
                "maDocGia", maDocGia
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/docgia/me/status")
    public ResponseEntity<Map<String, Object>> getAccountStatus(HttpServletRequest request) {
        try {
            String maDocGia = getMaDocGiaFromToken(request);
            
            // Lấy thông tin độc giả
            DocGia docGia = docGiaService.findByEmail(JwtUtil.getUsernameFromToken(
                request.getHeader("Authorization").substring(7)
            ));
            
            // Lấy thông tin phạt
            BigDecimal totalUnpaid = phatDocGiaService.getTotalUnpaidFines(maDocGia);
            boolean hasUnpaidFines = phatDocGiaService.hasUnpaidFines(maDocGia);
            List<PhatDocGia> unpaidFines = phatDocGiaService.getUnpaidFinesByDocGia(maDocGia);
            
            // Kiểm tra trạng thái tài khoản
            boolean isAccountLocked = docGia.getTrangThai() == DocGia.TrangThaiDocGia.TAMKHOA;
            
            Map<String, Object> response = Map.of(
                "maDocGia", maDocGia,
                "trangThaiTaiKhoan", docGia.getTrangThai().name(),
                "tongTienPhat", totalUnpaid,
                "formattedAmount", String.format("%,.0f VND", totalUnpaid.doubleValue()),
                "soLuongPhatChuaThanhToan", unpaidFines.size(),
                "coTheHoatDong", !isAccountLocked,
                "isAccountLocked", isAccountLocked,
                "hasUnpaidFines", hasUnpaidFines
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting account status:", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/thanhtoan/{maPhat}")
    public ResponseEntity<Map<String, Object>> payFine(@PathVariable Long maPhat, HttpServletRequest request) {
        try {
            // Xác thực người dùng
            String maDocGia = getMaDocGiaFromToken(request);
            
            // Kiểm tra phạt có thuộc về người dùng không
            PhatDocGia phat = phatDocGiaService.getFinesByDocGia(maDocGia).stream()
                .filter(p -> p.getMaPhat().equals(maPhat))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin phạt"));
            
            // Lưu thông tin trước khi thanh toán
            BigDecimal soTienPhat = phat.getSoTienPhat();
            String sachName = phat.getTheoDoiMuonSach().getSach().getTenSach();
            
            phatDocGiaService.payFine(maPhat);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Thanh toán phạt thành công",
                "maPhat", maPhat,
                "soTienPhat", soTienPhat,
                "tenSach", sachName
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            );
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/admin/miengiam/{maPhat}")
    public ResponseEntity<Map<String, Object>> exemptFine(@PathVariable Long maPhat, @RequestBody Map<String, String> requestBody) {
        try {
            String reason = requestBody.getOrDefault("reason", "Miễn giảm bởi admin");
            phatDocGiaService.exemptFine(maPhat, reason);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Miễn giảm phạt thành công"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            );
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/admin/check-overdue")
    public ResponseEntity<Map<String, Object>> checkOverdueBooks() {
        try {
            phatDocGiaService.checkAndCreateFinesForOverdueBooks();
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Đã kiểm tra và tạo phạt cho sách quá hạn",
                "timestamp", java.time.LocalDateTime.now().toString()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            );
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<PhatDocGia>> getAllFines() {
        try {
            List<PhatDocGia> allFines = phatDocGiaService.getAllFines();
            return ResponseEntity.ok(allFines);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/admin/unpaid")
    public ResponseEntity<List<PhatDocGia>> getUnpaidFines() {
        try {
            List<PhatDocGia> unpaidFines = phatDocGiaService.getUnpaidFines();
            return ResponseEntity.ok(unpaidFines);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Thêm method này để test
    @PostMapping("/admin/test-create-fine")
    public ResponseEntity<Map<String, Object>> testCreateFine() {
        try {
            // Tìm record TheoDoiMuonSach cụ thể (DG001/S001/2024-11-01)
            TheoDoiMuonSachId id = new TheoDoiMuonSachId("DG001", "S001", LocalDate.of(2024, 11, 1));
            TheoDoiMuonSach record = theoDoiMuonSachService.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy record mượn sách"));
            
            // Tính toán
            LocalDate today = LocalDate.now();
            LocalDate ngayTra = LocalDate.of(2024, 11, 15);
            int soNgayQuaHan = (int) java.time.temporal.ChronoUnit.DAYS.between(ngayTra, today);
            BigDecimal soTienPhat = new BigDecimal("2000").multiply(new BigDecimal(soNgayQuaHan));
            
            // Tạo phạt
            PhatDocGia phatDocGia = new PhatDocGia();
            phatDocGia.setTheoDoiMuonSach(record);
            phatDocGia.setSoTienPhat(soTienPhat);
            phatDocGia.setSoNgayQuaHan(soNgayQuaHan);
            phatDocGia.setNgayTaoPhat(LocalDateTime.now());
            phatDocGia.setTrangThaiPhat(PhatDocGia.TrangThaiPhat.CHUATHANHTOAN);
            phatDocGia.setGhiChu("Test tạo phạt manual - Quá hạn " + soNgayQuaHan + " ngày");
            
            PhatDocGia saved = phatDocGiaService.save(phatDocGia); // Cần thêm method save vào service
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Tạo phạt test thành công",
                "maPhat", saved.getMaPhat(),
                "soTienPhat", soTienPhat,
                "soNgayQuaHan", soNgayQuaHan
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Lỗi: " + e.getMessage()
            );
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/docgia/{maDocGia}")
    public ResponseEntity<List<PhatDocGiaDTO>> getFinesByDocGia(@PathVariable String maDocGia) {
        try {
            List<PhatDocGiaDTO> fines = phatDocGiaService.getFineDTOsByDocGia(maDocGia);
            return ResponseEntity.ok(fines);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}