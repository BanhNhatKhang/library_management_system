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
import java.util.stream.Collectors;

@Service
public class NhanVienService {
    
    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<NhanVienDTO> getAllNhanVien() {
        List<NhanVien> nhanVienList = nhanVienRepository.findAll();
        return nhanVienList.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<NhanVienDTO> getNhanVienById(String maNhanVien) {
        return nhanVienRepository.findById(maNhanVien)
                .map(this::toDTO);
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

        public NhanVien toEntity(NhanVienDangKyDTO dto) {
        NhanVien entity = new NhanVien();
        entity.setMaNhanVien(dto.getMaNhanVien());
        entity.setHoTenNV(dto.getHoTen());
        entity.setEmail(dto.getEmail());
        entity.setDienThoai(dto.getDienThoai());
        entity.setDiaChi(dto.getDiaChi());
        entity.setNgaySinh(dto.getNgaySinh());
        
        // SỬA: Set password cho registration
        if (dto.getMatKhau() != null) {
            entity.setMatKhau(dto.getMatKhau()); // Có thể cần hash password
        }
        
        // Convert String sang enum
        if (dto.getVaiTro() != null) {
            try {
                entity.setVaiTro(NhanVien.VaiTroNhanVien.valueOf(dto.getVaiTro()));
            } catch (IllegalArgumentException e) {
                entity.setVaiTro(NhanVien.VaiTroNhanVien.NHANVIEN); // Default
            }
        }
        
        if (dto.getTrangThai() != null) {
            try {
                entity.setTrangThai(NhanVien.TrangThaiNhanVien.valueOf(dto.getTrangThai()));
            } catch (IllegalArgumentException e) {
                entity.setTrangThai(NhanVien.TrangThaiNhanVien.HOATDONG); // Default
            }
        } else {
            entity.setTrangThai(NhanVien.TrangThaiNhanVien.HOATDONG); // Default cho nhân viên mới
        }
        
        return entity;
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

    public NhanVien findByEmail(String email) {
        NhanVien nhanVien = nhanVienRepository.findByEmail(email);
        if (nhanVien == null) {
            throw new RuntimeException("NhanVien không tồn tại với email: " + email);
        }
        return nhanVien;
    }

        public NhanVienDTO toDTO(NhanVien entity) {
        NhanVienDTO dto = new NhanVienDTO();
        dto.setMaNhanVien(entity.getMaNhanVien());
        dto.setHoTen(entity.getHoTenNV()); // SỬA: Map từ hoTenNV
        dto.setEmail(entity.getEmail());
        dto.setDienThoai(entity.getDienThoai());
        dto.setDiaChi(entity.getDiaChi());
        dto.setNgaySinh(entity.getNgaySinh());
        
        // SỬA: Convert enum sang String
        if (entity.getVaiTro() != null) {
            dto.setVaiTro(entity.getVaiTro().name()); // Hoặc .toString()
        }
        
        if (entity.getTrangThai() != null) {
            dto.setTrangThai(entity.getTrangThai().name()); // Hoặc .toString()
        }
        
        return dto;
    }

        public NhanVien toEntity(NhanVienDTO dto) {
        NhanVien entity = new NhanVien();
        entity.setMaNhanVien(dto.getMaNhanVien());
        entity.setHoTenNV(dto.getHoTen()); // SỬA: Map sang hoTenNV
        entity.setEmail(dto.getEmail());
        entity.setDienThoai(dto.getDienThoai());
        entity.setDiaChi(dto.getDiaChi());
        entity.setNgaySinh(dto.getNgaySinh());
        
        // SỬA: Convert String sang enum
        if (dto.getVaiTro() != null) {
            try {
                entity.setVaiTro(NhanVien.VaiTroNhanVien.valueOf(dto.getVaiTro()));
            } catch (IllegalArgumentException e) {
                entity.setVaiTro(NhanVien.VaiTroNhanVien.NHANVIEN); // Default
            }
        }
        
        if (dto.getTrangThai() != null) {
            try {
                entity.setTrangThai(NhanVien.TrangThaiNhanVien.valueOf(dto.getTrangThai()));
            } catch (IllegalArgumentException e) {
                entity.setTrangThai(NhanVien.TrangThaiNhanVien.HOATDONG); // Default
            }
        }
        
        return entity;
    }
}