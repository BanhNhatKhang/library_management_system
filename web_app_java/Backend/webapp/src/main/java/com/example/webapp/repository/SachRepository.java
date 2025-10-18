package com.example.webapp.repository;

import com.example.webapp.models.Sach;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SachRepository extends JpaRepository<Sach, String> {
    Optional<Sach> findByMaSach(String maSach);
    Optional<Sach> findByTenSach(String tenSach);
    List<Sach> findByTacGia(String tacGia);
    List<Sach> findByNhaXuatBan_TenNhaXuatBan(String tenNhaXuatBan);
    List<Sach> findByTheLoais_MaTheLoai(String maTheLoai);
    boolean existsByMaSach(String maSach);
    boolean existsByTenSach(String tenSach);
}