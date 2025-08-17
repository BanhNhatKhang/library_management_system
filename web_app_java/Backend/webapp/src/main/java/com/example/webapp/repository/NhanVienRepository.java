package com.example.webapp.repository;

import com.example.webapp.models.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
    NhanVien findByEmail(String email);
    NhanVien findByDienThoai(String dienThoai);
    NhanVien findByMaNhanVien(String maNhanVien);
    boolean existsByMaNhanVien(String maNhanVien);
    boolean existsByEmail(String email);
    boolean existsByDienThoai(String dienThoai);
}