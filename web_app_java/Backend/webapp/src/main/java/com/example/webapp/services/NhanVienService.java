package com.example.webapp.services;

import com.example.webapp.models.NhanVien;
import com.example.webapp.dto.NhanVienDTO;
import com.example.webapp.dto.NhanVienDangKyDTO;
import com.example.webapp.repository.NhanVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NhanVienService {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<NhanVienDTO> getAllNhanVien() {
        return nhanVienRepository.findAll().stream().map(this::toDTO).toList();
    }

    public Optional<NhanVienDTO> getNhanVienById(String maNhanVien) {
        return nhanVienRepository.findById(maNhanVien).map(this::toDTO);
    }

    public String generateMaNhanVien() {
        String lastMaNhanVien = nhanVienRepository.findMaxMaNhanVien();
        int nextNumber = 1;
        if (lastMaNhanVien != null) {
            nextNumber = Integer.parseInt(lastMaNhanVien.substring(2)) + 1; // Giả sử mã nhân viên có định dạng "NV001"
        }
        return String.format("NV%03d", nextNumber); // Tạo mã nhân viên mới với định dạng "NV001"
    }

    public NhanVien saveNhanVien(NhanVien nhanVien) {
        if (nhanVien.getMaNhanVien() == null || nhanVien.getMaNhanVien().isEmpty()) {
            nhanVien.setMaNhanVien(generateMaNhanVien());
        }

        nhanVien.setMatKhau(passwordEncoder.encode(nhanVien.getMatKhau()));
        return nhanVienRepository.save(nhanVien);
    }

    public NhanVien updateNhanVien(String maNhanVien, NhanVien nhanVien) {
        NhanVien existing = nhanVienRepository.findById(maNhanVien)
            .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));

        if (nhanVienRepository.existsByEmail(nhanVien.getEmail()) &&
            !existing.getEmail().equals(nhanVien.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng bởi nhân viên khác");
        }

        if (nhanVienRepository.existsByDienThoai(nhanVien.getDienThoai()) &&
            !existing.getDienThoai().equals(nhanVien.getDienThoai())) {
            throw new RuntimeException("Điện thoại đã được sử dụng bởi nhân viên khác");
        }
        
        existing.setHoTenNV(nhanVien.getHoTenNV());
        existing.setEmail(nhanVien.getEmail());
        existing.setDienThoai(nhanVien.getDienThoai());
        existing.setNgaySinh(nhanVien.getNgaySinh());
        existing.setDiaChi(nhanVien.getDiaChi());
        existing.setTrangThai(nhanVien.getTrangThai());

        
        if (nhanVien.getMatKhau() != null && !nhanVien.getMatKhau().isEmpty()) {
            existing.setMatKhau(passwordEncoder.encode(nhanVien.getMatKhau()));
        }

        return nhanVienRepository.save(existing);
    }

    public void deleteNhanVien(String maNhanVien) {
        nhanVienRepository.deleteById(maNhanVien);
    }

    public NhanVien loginNhanVien(String emailOrPhone, String matKhau) {
        NhanVien nv = nhanVienRepository.findByEmail(emailOrPhone);
        if (nv == null) {
            nv = nhanVienRepository.findByDienThoai(emailOrPhone);
        }
        if (nv == null || !passwordEncoder.matches(matKhau, nv.getMatKhau())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không đúng");
        }
        return nv;
    }

    public NhanVienDTO toDTO(NhanVien nhanVien) {
        NhanVienDTO nhanVienDTO = new NhanVienDTO();
        nhanVienDTO.setMaNhanVien(nhanVien.getMaNhanVien());
        nhanVienDTO.setHoTen(nhanVien.getHoTenNV());
        nhanVienDTO.setEmail(nhanVien.getEmail());
        nhanVienDTO.setDienThoai(nhanVien.getDienThoai());
        nhanVienDTO.setNgaySinh(nhanVien.getNgaySinh());
        nhanVienDTO.setDiaChi(nhanVien.getDiaChi());
        return nhanVienDTO;
    }

    public NhanVien toEntity(NhanVienDangKyDTO nhanVienDangKyDTO) {
        NhanVien nhanVien = new NhanVien();
        nhanVien.setMaNhanVien(nhanVienDangKyDTO.getMaNhanVien());
        nhanVien.setHoTenNV(nhanVienDangKyDTO.getHoTen());
        nhanVien.setEmail(nhanVienDangKyDTO.getEmail());
        nhanVien.setDienThoai(nhanVienDangKyDTO.getDienThoai());
        nhanVien.setNgaySinh(nhanVienDangKyDTO.getNgaySinh());
        nhanVien.setMatKhau(nhanVienDangKyDTO.getMatKhau());
        nhanVien.setDiaChi(nhanVienDangKyDTO.getDiaChi());
        return nhanVien;
    }

    public NhanVien toEntity(NhanVienDTO nhanVienDTO) {
        NhanVien nhanVien = new NhanVien();
        nhanVien.setMaNhanVien(nhanVienDTO.getMaNhanVien());
        nhanVien.setHoTenNV(nhanVienDTO.getHoTen());
        nhanVien.setEmail(nhanVienDTO.getEmail());
        nhanVien.setDienThoai(nhanVienDTO.getDienThoai());
        nhanVien.setNgaySinh(nhanVienDTO.getNgaySinh());
        nhanVien.setDiaChi(nhanVienDTO.getDiaChi());
        return nhanVien;
    }
}