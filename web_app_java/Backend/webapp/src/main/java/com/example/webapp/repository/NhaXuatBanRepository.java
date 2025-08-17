package com.example.webapp.repository;

import com.example.webapp.models.NhaXuatBan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NhaXuatBanRepository extends JpaRepository<NhaXuatBan, String> {
    NhaXuatBan findByMaNhaXuatBan(String maNhaXuatBan);
    NhaXuatBan findByTenNhaXuatBan(String tenNhaXuatBan);
    boolean existsByTenNhaXuatBan(String tenNhaXuatBan);
    boolean existsByMaNhaXuatBan(String maNhaXuatBan);
}