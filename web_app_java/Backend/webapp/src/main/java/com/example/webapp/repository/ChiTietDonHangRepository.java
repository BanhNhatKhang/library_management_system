package com.example.webapp.repository;

import com.example.webapp.models.ChiTietDonHang;
import com.example.webapp.models.ChiTietDonHangId;
import com.example.webapp.models.DonHang;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

import java.util.List;
import java.util.Optional;

public interface ChiTietDonHangRepository extends JpaRepository<ChiTietDonHang, ChiTietDonHangId> {

    List<ChiTietDonHang> findByDonHang_MaDonHang(String maDonHang);
    List<ChiTietDonHang> findByDonHang(DonHang donHang);
    List<ChiTietDonHang> findBySach_MaSach(String maSach);
    Optional<ChiTietDonHang> findByDonHang_MaDonHangAndSach_MaSach(String maDonHang, String maSach);
    long countByDonHang_MaDonHang(String maDonHang);
    void deleteByDonHang_MaDonHang(String maDonHang);
    void deleteBySach_MaSach(String maSach);
    boolean existsByDonHang_MaDonHangAndSach_MaSach(String maDonHang, String maSach);

    // Tính tổng tiền của 1 đơn hàng
    @Query("SELECT SUM(c.soLuong * c.donGia) " +
           "FROM ChiTietDonHang c " +
           "WHERE c.donHang.maDonHang = :maDonHang")
    BigDecimal calculateTotalByDonHang(@Param("maDonHang") String maDonHang);

    // Lấy top sách bán chạy (theo tổng số lượng)
    @Query("SELECT c.sach.maSach, SUM(c.soLuong) as tongSoLuong " +
           "FROM ChiTietDonHang c " +
           "GROUP BY c.sach.maSach " +
           "ORDER BY tongSoLuong DESC")
    List<Object[]> findTopSachBanChay();
}
