package com.example.webapp.controllers.thongbaomuon;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.dto.ThongBaoMuonSachDTO;
import com.example.webapp.services.ThongBaoMuonSachService;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;
import com.example.webapp.security.JwtUtil;

@RestController
@RequestMapping("/api/thongbao")
public class ThongBaoMuonSachController {

    @Autowired
    private ThongBaoMuonSachService thongBaoMuonSachService;

    @GetMapping
    public List<ThongBaoMuonSachDTO> getAllThongBao() {
        return thongBaoMuonSachService.getAll();
    }

    @GetMapping("/id/{id}")
    public ThongBaoMuonSachDTO getThongBaoById(@PathVariable Long id) {
        return thongBaoMuonSachService.getById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo với id: " + id));
    }

    @GetMapping("/docgia/{maDocGia}")
    public List<ThongBaoMuonSachDTO> getThongBaoByMaDocGia(@PathVariable String maDocGia) {
        System.out.println("Getting notifications for docgia: " + maDocGia);
        return thongBaoMuonSachService.getByMaDocGia(maDocGia);
    }

    @GetMapping("/loai/{loaiThongBao}")
    public List<ThongBaoMuonSachDTO> getThongBaoByLoai(@PathVariable String loaiThongBao) {
        return thongBaoMuonSachService.getByLoaiThongBao(loaiThongBao);
    }

    @GetMapping("/dadoc/{trangThaiDaDoc}")
    public List<ThongBaoMuonSachDTO> getThongBaoByTrangThaiDaDoc(@PathVariable Boolean trangThaiDaDoc) {
        return thongBaoMuonSachService.getByTrangThaiDaDoc(trangThaiDaDoc);
    }

    @PostMapping
    public ThongBaoMuonSachDTO createThongBao(@RequestBody ThongBaoMuonSachDTO dto) {
        return thongBaoMuonSachService.save(dto);
    }

    @PostMapping("/auto/{loaiThongBao}")
    public String createAutoThongBao(@PathVariable String loaiThongBao, @RequestBody Map<String, String> request) {
        String noiDungMau = request.get("noiDung");
        return thongBaoMuonSachService.taoThongBaoTuDong(loaiThongBao, noiDungMau);
    }

    @DeleteMapping("/{id}")
    public String deleteThongBao(@PathVariable Long id) {
        thongBaoMuonSachService.deleteById(id);
        return "Thông báo với id " + id + " đã được xóa thành công";
    }

    @PutMapping("/{id}")
    public ThongBaoMuonSachDTO updateThongBao(@PathVariable Long id, @RequestBody ThongBaoMuonSachDTO dto) {
        return thongBaoMuonSachService.updateThongBao(id, dto);
    }

    @PutMapping("/{id}/mark-read")
    public String markAsRead(@PathVariable Long id) {
        System.out.println("Marking notification as read: " + id);
        thongBaoMuonSachService.markAsRead(id);
        return "Đã đánh dấu thông báo đã đọc";
    }

    @GetMapping("/current-user")
    public ResponseEntity<Map<String, Object>> getThongBaoForCurrentUser(
        HttpServletRequest request,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "thoiGianGui,desc") String sort,
        @RequestParam(required = false) Boolean unreadOnly,
        @RequestParam(required = false) Boolean readOnly
    ) {
        System.out.println("Getting notifications for current user with pagination");
        
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String email = JwtUtil.getUsernameFromToken(token);
                System.out.println("Current user email: " + email);
                
                List<ThongBaoMuonSachDTO> allNotifications = thongBaoMuonSachService.getByEmail(email);
                
                // Filter theo trạng thái đọc nếu có
                if (unreadOnly != null && unreadOnly) {
                    allNotifications = allNotifications.stream()
                        .filter(n -> !n.getTrangThaiDaDoc())
                        .collect(Collectors.toList());
                } else if (readOnly != null && readOnly) {
                    allNotifications = allNotifications.stream()
                        .filter(ThongBaoMuonSachDTO::getTrangThaiDaDoc)
                        .collect(Collectors.toList());
                }
                
                // Tính toán phân trang
                int totalElements = allNotifications.size();
                int totalPages = (int) Math.ceil((double) totalElements / size);
                int start = page * size;
                int end = Math.min(start + size, totalElements);
                
                List<ThongBaoMuonSachDTO> pageContent = allNotifications.subList(start, end);
                
                // Tạo response theo format Spring Data Page
                Map<String, Object> response = new HashMap<>();
                response.put("content", pageContent);
                response.put("totalElements", totalElements);
                response.put("totalPages", totalPages);
                response.put("number", page);
                response.put("size", size);
                response.put("first", page == 0);
                response.put("last", page >= totalPages - 1);
                
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                System.out.println("Error extracting email from token: " + e.getMessage());
                throw new RuntimeException("Invalid token");
            }
        }
        throw new RuntimeException("No authorization header");
    }
}