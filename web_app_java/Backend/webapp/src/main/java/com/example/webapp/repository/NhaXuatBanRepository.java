package com.example.webapp.repository;

import com.example.webapp.models.NhaXuatBan;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NhaXuatBanRepository extends JpaRepository<NhaXuatBan, String> {
    NhaXuatBan findByMaNhaXuatBan(String maNhaXuatBan);
    NhaXuatBan findByTenNhaXuatBan(String tenNhaXuatBan);
    boolean existsByTenNhaXuatBan(String tenNhaXuatBan);
    boolean existsByMaNhaXuatBan(String maNhaXuatBan);

    @Query("SELECT DISTINCT n.tenNhaXuatBan FROM NhaXuatBan n WHERE LOWER(n.tenNhaXuatBan) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<String> findTenNhaXuatBanContaining(@Param("query") String query, Pageable pageable);
}