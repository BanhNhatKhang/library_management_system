package com.example.webapp.repository;

import com.example.webapp.models.TheoDoiMuonSach;
import com.example.webapp.models.TheoDoiMuonSachId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TheoDoiMuonSachRepository extends JpaRepository<TheoDoiMuonSach, TheoDoiMuonSachId> {
    List<TheoDoiMuonSach> findByDocGia_MaDocGia(String maDocGia);
    List<TheoDoiMuonSach> findByTrangThaiMuon(TheoDoiMuonSach.TrangThaiMuon trangThaiMuon);
}