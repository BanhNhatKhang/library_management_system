package com.example.webapp.repository;

import com.example.webapp.models.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDate;

public interface DonHangRepository extends JpaRepository<DonHang, String> {
        List<DonHang> findByNgayDat(LocalDate ngayDat);
        List<DonHang> findByDocGia_MaDocGia(String maDocGia);
        List<DonHang> findByDocGia_HoLotIgnoreCaseContainingAndDocGia_TenIgnoreCaseContaining(String hoLot, String ten);
        List<DonHang> findByDocGia_DienThoai(String dienThoai);
        boolean existsByMaDonHang(String maDonHang);
}