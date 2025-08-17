package com.example.webapp.repository;

import com.example.webapp.models.TheLoai;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TheLoaiRepository extends JpaRepository<TheLoai, String> {
    TheLoai findByMaTheLoai(String maTheLoai);
    TheLoai findByTenTheLoai(String tenTheLoai);
    boolean existsByMaTheLoai(String maTheLoai);
    boolean existsByTenTheLoai(String tenTheLoai);
}