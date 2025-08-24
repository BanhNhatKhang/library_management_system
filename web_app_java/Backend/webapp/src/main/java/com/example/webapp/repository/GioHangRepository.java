package com.example.webapp.repository;

import com.example.webapp.models.GioHang;
import com.example.webapp.models.GioHangId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GioHangRepository extends JpaRepository<GioHang, GioHangId> {
    List<GioHang> findByDocGia_MaDocGia(String maDocGia);
    List<GioHang> findByDocGia_HoLotIgnoreCaseContainingAndDocGia_TenIgnoreCaseContaining(String hoLot, String ten);
    List<GioHang> findByDocGia_DienThoai(String dienThoai);
    List<GioHang> findByDocGia_Email(String email);
    void deleteByDocGia_MaDocGia(String maDocGia);
}