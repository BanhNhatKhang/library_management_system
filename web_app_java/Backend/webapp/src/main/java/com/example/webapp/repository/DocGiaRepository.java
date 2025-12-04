package com.example.webapp.repository;

import com.example.webapp.models.DocGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DocGiaRepository extends JpaRepository<DocGia, String> {
    DocGia findByEmail(String email);
    DocGia findByDienThoai(String dienThoai);
    Optional<DocGia> findByMaDocGia(String maDocGia);
    boolean existsByMaDocGia(String maDocGia);
    boolean existsByEmail(String email);
    boolean existsByDienThoai(String dienThoai);
    List<DocGia> findTop5ByOrderByMaDocGiaDesc();

    @Query("SELECT MAX(d.maDocGia) FROM DocGia d")
    String findMaxMaDocGia();
}