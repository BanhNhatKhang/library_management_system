package com.example.webapp.repository;

import com.example.webapp.models.UuDai;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UuDaiRepository extends JpaRepository<UuDai, String> {
    Optional<UuDai> findByMaUuDai(String maUuDai);
    UuDai findByTenUuDai(String tenUuDai);
    List<UuDai> findByNgayBatDau(LocalDate ngayBatDau);
    List<UuDai> findByNgayKetThuc(LocalDate ngayKetThuc);
    boolean existsByMaUuDai(String maUuDai);
    boolean existsByTenUuDai(String tenUuDai);
}