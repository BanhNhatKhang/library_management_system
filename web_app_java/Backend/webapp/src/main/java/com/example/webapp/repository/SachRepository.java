package com.example.webapp.repository;

import com.example.webapp.models.Sach;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    List<Sach> findByTenSachContainingIgnoreCase(String tenSach);

    @Query("SELECT DISTINCT s FROM Sach s JOIN s.theLoais tl WHERE LOWER(tl.tenTheLoai) LIKE LOWER(CONCAT('%', :theLoai, '%'))")
    List<Sach> findSachByTheLoaiContaining(@Param("theLoai") String theLoai);

    @Query("SELECT DISTINCT s.tacGia FROM Sach s WHERE LOWER(s.tacGia) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<String> findDistinctTacGiaContaining(@Param("query") String query, Pageable pageable);
}