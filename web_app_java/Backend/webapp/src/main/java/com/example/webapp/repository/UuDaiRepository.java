package com.example.webapp.repository;

import com.example.webapp.models.UuDai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("SELECT u FROM UuDai u WHERE u.ngayBatDau <= :now AND u.ngayKetThuc >= :now " +
           "AND u.maUuDai NOT IN (SELECT DISTINCT su.maUuDai FROM Sach s JOIN s.uuDais su)")
    List<UuDai> findActiveUuDaiNotLinkedToBooks(@Param("now") LocalDate now);
}