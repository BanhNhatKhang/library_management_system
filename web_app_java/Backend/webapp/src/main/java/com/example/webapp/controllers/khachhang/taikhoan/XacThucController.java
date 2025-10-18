package   com.example.webapp.controllers.khachhang.taikhoan;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.example.webapp.models.*;
import com.example.webapp.security.JwtUtil;
import com.example.webapp.services.*;

import jakarta.validation.Valid;

import com.example.webapp.dto.*;

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
            
            return ResponseEntity.ok(new JwtResponse(token, "DOCGIA", docGia.getTen()));
            
        } catch (RuntimeException e) {
            try {
                NhanVien nhanVien = nhanVienService.loginNhanVien(dangNhapDTO.getEmailOrDienThoai(), dangNhapDTO.getMatKhau());
                
                String role = nhanVien.getVaiTro().toString(); 
                
                String token = JwtUtil.generateToken(nhanVien.getEmail(), role);

                return ResponseEntity.ok(new JwtResponse(token, role, nhanVien.getHoTenNV()));
                
            } catch (RuntimeException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản hoặc mật khẩu không đúng");
            }
        }
    }
}