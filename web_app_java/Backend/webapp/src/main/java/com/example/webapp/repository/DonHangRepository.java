package com.example.webapp.repository;

import com.example.webapp.models.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.LocalDate;

public interface DonHangRepository extends JpaRepository<DonHang, String> {
        List<DonHang> findByNgayDat(LocalDate ngayDat);
        List<DonHang> findByDocGia_MaDocGia(String maDocGia);
        List<DonHang> findByDocGia_HoLotIgnoreCaseContainingAndDocGia_TenIgnoreCaseContaining(String hoLot, String ten);
        List<DonHang> findByDocGia_DienThoai(String dienThoai);
        boolean existsByMaDonHang(String maDonHang);
        // Thêm method phân trang
        Page<DonHang> findByDocGia_MaDocGia(String maDocGia, Pageable pageable);
        // Lấy tất cả đơn hàng chưa bị hủy
        @Query("SELECT d FROM DonHang d WHERE d.trangThai != 'DAHUY'")
        List<DonHang> findAllActive();

        // Lấy đơn hàng theo độc giả (không bao gồm đã hủy)
        @Query("SELECT d FROM DonHang d WHERE d.docGia.maDocGia = :maDocGia AND d.trangThai != 'DAHUY'")
        List<DonHang> findActiveByDocGia_MaDocGia(@Param("maDocGia") String maDocGia);

        // Phân trang không bao gồm đã hủy  
        @Query("SELECT d FROM DonHang d WHERE d.docGia.maDocGia = :maDocGia AND d.trangThai != 'DAHUY'")
        Page<DonHang> findActiveByDocGia_MaDocGia(@Param("maDocGia") String maDocGia, Pageable pageable);

        // Tìm theo trạng thái
        List<DonHang> findByTrangThai(DonHang.TrangThaiDonHang trangThai);
}