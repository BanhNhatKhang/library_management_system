package com.example.webapp.repository;

import com.example.webapp.models.TheoDoiMuonSach;
import com.example.webapp.models.TheoDoiMuonSach.TrangThaiMuon;
import com.example.webapp.models.TheoDoiMuonSachId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface TheoDoiMuonSachRepository extends JpaRepository<TheoDoiMuonSach, TheoDoiMuonSachId> {
    List<TheoDoiMuonSach> findByDocGia_MaDocGia(String maDocGia);
    
    // Thêm phương thức phân trang
    Page<TheoDoiMuonSach> findByDocGia_MaDocGia(String maDocGia, Pageable pageable);
    
    List<TheoDoiMuonSach> findByTrangThaiMuon(TheoDoiMuonSach.TrangThaiMuon trangThaiMuon);
    boolean existsBySach_MaSachAndTrangThaiMuonIn(String maSach, List<TrangThaiMuon> trangThais);
}