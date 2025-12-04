package com.example.webapp.controllers.khachhang.taikhoan;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.example.webapp.models.*;
import com.example.webapp.security.JwtUtil;
import com.example.webapp.services.*;

import jakarta.validation.Valid;

import com.example.webapp.dto.*;
import java.util.Map;

@RestController
@RequestMapping("/api/xacthuc")
public class XacThucController {

    @Autowired
    private DocGiaService docGiaService;

    @Autowired
    private NhanVienService nhanVienService;

    @PostMapping("/dangky")
    public DocGia registerDocGia(@RequestBody @Valid DocGiaDangKyDTO docGiaDangKyDTO) {
        return docGiaService.registerDocGia(docGiaDangKyDTO);
    }

    @PostMapping("/dangnhap")
    public ResponseEntity<?> login(@RequestBody DangNhapDTO dangNhapDTO) {
        try {
            DocGia docGia = docGiaService.loginDocGia(dangNhapDTO.getEmailOrDienThoai(), dangNhapDTO.getMatKhau());
            
            String token = JwtUtil.generateToken(docGia.getEmail(), "DOCGIA");
            String refreshToken = JwtUtil.generateRefreshToken(docGia.getEmail());
            
            return ResponseEntity.ok(new JwtResponse(token, refreshToken, "DOCGIA", docGia.getTen()));
            
        } catch (RuntimeException e) {
            try {
                NhanVien nhanVien = nhanVienService.loginNhanVien(dangNhapDTO.getEmailOrDienThoai(), dangNhapDTO.getMatKhau());
                
                String role = nhanVien.getVaiTro().toString(); 
                
                String token = JwtUtil.generateToken(nhanVien.getEmail(), role);
                String refreshToken = JwtUtil.generateRefreshToken(nhanVien.getEmail());

                return ResponseEntity.ok(new JwtResponse(token, refreshToken, role, nhanVien.getHoTenNV()));
                
            } catch (RuntimeException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản hoặc mật khẩu không đúng");
            }
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            
            if (refreshToken == null || !JwtUtil.validateJwtToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Refresh token không hợp lệ"));
            }

            String username = JwtUtil.getUsernameFromToken(refreshToken);
            
            // Kiểm tra xem user có phải là DocGia hay NhanVien
            String role;
            String name;
            
            try {
                DocGia docGia = docGiaService.findByEmail(username);
                if (docGia != null) {
                    role = "DOCGIA";
                    name = docGia.getTen();
                } else {
                    throw new RuntimeException("DocGia not found");
                }
            } catch (RuntimeException e) {
                try {
                    NhanVien nhanVien = nhanVienService.findByEmail(username);
                    role = nhanVien.getVaiTro().toString();
                    name = nhanVien.getHoTenNV();
                } catch (RuntimeException ex) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User không tồn tại"));
                }
            }

            String newToken = JwtUtil.generateToken(username, role);
            String newRefreshToken = JwtUtil.generateRefreshToken(username);

            return ResponseEntity.ok(new JwtResponse(newToken, newRefreshToken, role, name));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Không thể làm mới token"));
        }
    }
}