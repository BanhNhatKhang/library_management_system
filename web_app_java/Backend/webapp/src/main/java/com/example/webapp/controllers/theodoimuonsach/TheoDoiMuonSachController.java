package com.example.webapp.controllers.theodoimuonsach;

import com.example.webapp.dto.TheoDoiMuonSachDTO;
import com.example.webapp.models.*;
import com.example.webapp.services.TheoDoiMuonSachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.ZoneId;

import com.example.webapp.security.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/theodoimuonsach")
public class TheoDoiMuonSachController {

    @Autowired
    private TheoDoiMuonSachService theoDoiMuonSachService;

    @GetMapping
    public List<TheoDoiMuonSachDTO> getAll() {
        return theoDoiMuonSachService.getAll();
    }

    @GetMapping("/{maDocGia}")
    public List<TheoDoiMuonSachDTO> getByMaDocGia(@PathVariable String maDocGia) {
        return theoDoiMuonSachService.getByMaDocGia(maDocGia);
    }

    @GetMapping("/sach/{maSach}")
    public List<TheoDoiMuonSachDTO> getByMaSach(@PathVariable String maSach) {
        return theoDoiMuonSachService.getByMaSach(maSach);
    }

    @GetMapping("/item")
    public ResponseEntity<?> getById(@RequestParam String maDocGia,
                                     @RequestParam String maSach,
                                     @RequestParam String ngayMuon) {
        System.out.println("Controller: received ngayMuon(raw)=" + ngayMuon);
        LocalDate parsed = parseFlexibleDate(ngayMuon);
        if (parsed == null) {
            System.out.println("Controller: cannot parse ngayMuon=" + ngayMuon);
            return ResponseEntity.badRequest().body("Cannot parse ngayMuon: " + ngayMuon);
        }
        System.out.println("Controller: parsed ngayMuon=" + parsed);
        TheoDoiMuonSachId id = new TheoDoiMuonSachId(maDocGia, maSach, parsed);
        Optional<TheoDoiMuonSach> opt = theoDoiMuonSachService.findById(id);
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        } else {
            // Fallback: nếu không có bản ghi với đủ khoá, trả bản ghi gần nhất (theo ngayMuon) để frontend biết ngày thực tế
            try {
                List<TheoDoiMuonSachDTO> byDocGia = theoDoiMuonSachService.getByMaDocGia(maDocGia);
                List<TheoDoiMuonSachDTO> matches = byDocGia.stream()
                        .filter(d -> maSach.equals(d.getMaSach()))
                        .collect(Collectors.toList());

                System.out.println("DEBUG: found " + byDocGia.size() + " records for maDocGia=" + maDocGia);
                System.out.println("DEBUG: of which " + matches.size() + " match maSach=" + maSach);
                for (TheoDoiMuonSachDTO d : matches) {
                    System.out.println("  -> entry: maSach=" + d.getMaSach() + " ngayMuon=" + d.getNgayMuon());
                }

                if (!matches.isEmpty()) {
                    // trả entry đầu (được sort bởi service/repository là gần nhất nếu service sắp xếp)
                    TheoDoiMuonSachDTO closest = matches.get(0);
                    System.out.println("Controller: returning fallback record with ngayMuon=" + closest.getNgayMuon());
                    return ResponseEntity.ok(closest);
                } else {
                    String body = "Not found for id=(" + maDocGia + "," + maSach + "," + parsed + "). No matching records.";
                    return ResponseEntity.status(404).body(body);
                }
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("Server error while debugging missing item");
            }
        }
    }

    // helper
    private LocalDate parseFlexibleDate(String s) {
        if (s == null) return null;
        try { return LocalDate.parse(s); } catch (Exception ignored) {}
        try {
          DateTimeFormatter f = DateTimeFormatter.ofPattern("d/M/yyyy");
          return LocalDate.parse(s, f);
        } catch (Exception ignored) {}
        try {
          String[] p = s.split(",");
          if (p.length>=3) return LocalDate.of(Integer.parseInt(p[0].trim()), Integer.parseInt(p[1].trim()), Integer.parseInt(p[2].trim()));
        } catch (Exception ignored) {}
        try {
          Instant inst = Instant.parse(s);
          return LocalDate.ofInstant(inst, ZoneId.systemDefault());
        } catch (Exception ignored) {}
        return null;
    }

    @GetMapping("/admin/all")
    public List<TheoDoiMuonSachDTO> getAllForAdmin() {
        return theoDoiMuonSachService.getAll();
    }

    @GetMapping("/admin/{maDocGia}")
    public List<TheoDoiMuonSachDTO> getByMaDocGiaForAdmin(@PathVariable String maDocGia) {
        return theoDoiMuonSachService.getByMaDocGia(maDocGia);
    }

    @PostMapping
    public TheoDoiMuonSachDTO create(@RequestBody TheoDoiMuonSachDTO dto) {
        return theoDoiMuonSachService.save(dto);
    }

    @PutMapping
    public TheoDoiMuonSachDTO update(@RequestBody TheoDoiMuonSachDTO dto) {
        return theoDoiMuonSachService.update(dto);
    }

    @PutMapping("/admin/update-status")
    public ResponseEntity<?> updateBorrowStatusForAdmin(@RequestBody TheoDoiMuonSachDTO request) {
        try {
            TheoDoiMuonSachDTO updatedDTO = theoDoiMuonSachService.update(request);
            return ResponseEntity.ok(updatedDTO);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật trạng thái: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }

    @PutMapping("/admin/bulk-update")
    public List<TheoDoiMuonSachDTO> bulkUpdateBorrowStatus(@RequestBody List<TheoDoiMuonSachDTO> dtoList) {
        return dtoList.stream()
                .map(dto -> theoDoiMuonSachService.update(dto))
                .collect(Collectors.toList());
    }

    @DeleteMapping
    public ResponseEntity<?> delete(@RequestParam String maDocGia, @RequestParam String maSach, @RequestParam String ngayMuon) {
        LocalDate parsedDate = parseFlexibleDate(ngayMuon);
        if (parsedDate == null) {
            return ResponseEntity.badRequest().body("Invalid ngayMuon format: " + ngayMuon);
        }
        TheoDoiMuonSachId id = new TheoDoiMuonSachId(maDocGia, maSach, parsedDate);
        theoDoiMuonSachService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-borrow-status")
    public ResponseEntity<Map<String, Object>> checkBorrowStatus(
        @RequestParam String maSach, 
        HttpServletRequest request
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Lấy email từ JWT token
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String email = JwtUtil.getUsernameFromToken(token);
                
                String checkResult = theoDoiMuonSachService.checkBorrowStatus(email, maSach);
                
                response.put("canBorrow", checkResult == null);
                response.put("message", checkResult);
                
                return ResponseEntity.ok(response);
            } else {
                response.put("canBorrow", false);
                response.put("message", "Vui lòng đăng nhập để mượn sách");
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            response.put("canBorrow", false);
            response.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}