package com.example.webapp.controllers.uudai;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.webapp.dto.*;
import com.example.webapp.services.UuDaiService;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/uudai")
@CrossOrigin(origins = "http://localhost:5173")
public class UuDaiController {

    @Autowired
    private UuDaiService uuDaiService;

    // THÊM ENDPOINT NÀY CHO DASHBOARD VÀ UDMANAGER
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'NHANVIEN', 'THUTHU', 'QUANLY')")
    public List<UuDaiDTO> getAllUuDai() {
        return uuDaiService.getAllUuDai();
    }

    // ENDPOINT CHO TRANG HOME (KHÔNG CẦN ĐĂNG NHẬP)
    @GetMapping("/public")
    public List<UuDaiDTO> getPublicUuDai() {
        return uuDaiService.getActiveUuDaiNotLinkedToBooks();
    }

    // THÊM ENDPOINT CHO CHI TIẾT ƯU ĐÃI
    @GetMapping("/{maUuDai}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'NHANVIEN', 'THUTHU', 'QUANLY')")
    public ResponseEntity<UuDaiDTO> getUuDaiById(@PathVariable String maUuDai) {
        return uuDaiService.getUuDaiById(maUuDai)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // THÊM ENDPOINT TẠO ƯU ĐÃI MỚI
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLY')")
    public ResponseEntity<?> createUuDai(@RequestBody UuDaiDTO uuDaiDTO) {
        try {
            UuDaiDTO result = uuDaiService.saveUuDai(uuDaiDTO);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // THÊM ENDPOINT CẬP NHẬT ƯU ĐÃI
    @PutMapping("/{maUuDai}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLY')")
    public ResponseEntity<?> updateUuDai(@PathVariable String maUuDai, @RequestBody UuDaiDTO uuDaiDTO) {
        try {
            UuDaiDTO result = uuDaiService.updateUuDai(maUuDai, uuDaiDTO);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // THÊM ENDPOINT XÓA ƯU ĐÃI
    @DeleteMapping("/{maUuDai}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLY')")
    public ResponseEntity<?> deleteUuDai(@PathVariable String maUuDai) {
        try {
            uuDaiService.deleteUuDai(maUuDai);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Xóa ưu đãi thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            // SỬA: Trả về status code phù hợp
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
    }

    // THÊM: Endpoint để vô hiệu hóa ưu đãi
    @PutMapping("/{maUuDai}/deactivate")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLY')")
    public ResponseEntity<?> deactivateUuDai(@PathVariable String maUuDai) {
        try {
            UuDaiDTO result = uuDaiService.deactivateUuDai(maUuDai);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Vô hiệu hóa ưu đãi thành công");
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // THÊM: Endpoint kiểm tra có thể xóa không
    @GetMapping("/{maUuDai}/can-delete")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLY')")
    public ResponseEntity<?> checkCanDelete(@PathVariable String maUuDai) {
        try {
            boolean canDelete = uuDaiService.canDeleteUuDai(maUuDai);
            Map<String, Object> response = new HashMap<>();
            response.put("canDelete", canDelete);
            if (!canDelete) {
                response.put("message", "Ưu đãi đang được sử dụng, không thể xóa");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // CÁC ENDPOINT CHO DOCGIA (GIỮ NGUYÊN)
    @PostMapping("/save/{maUuDai}")
    @PreAuthorize("hasRole('DOCGIA')")
    public ResponseEntity<?> saveUuDaiForDocGia(
            @PathVariable String maUuDai,
            Principal principal) {
        try {
            String email = principal.getName();
            String result = uuDaiService.saveUuDaiForDocGia(email, maUuDai);
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/saved")
    @PreAuthorize("hasRole('DOCGIA')")
    public List<UuDaiDTO> getSavedUuDai(Principal principal) {
        String email = principal.getName();
        return uuDaiService.getSavedUuDaiByEmail(email);
    }

    @DeleteMapping("/unsave/{maUuDai}")
    @PreAuthorize("hasRole('DOCGIA')")
    public ResponseEntity<?> unsaveUuDaiForDocGia(
            @PathVariable String maUuDai,
            Principal principal) {
        try {
            String email = principal.getName();
            String result = uuDaiService.unsaveUuDaiForDocGia(email, maUuDai);
            Map<String, Object> response = new HashMap<>();
            response.put("message", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}