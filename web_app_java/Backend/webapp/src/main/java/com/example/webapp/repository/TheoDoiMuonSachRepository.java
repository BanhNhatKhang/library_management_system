package com.example.webapp.repository;

import com.example.webapp.models.TheoDoiMuonSach;
import com.example.webapp.models.TheoDoiMuonSach.TrangThaiMuon;
import com.example.webapp.models.TheoDoiMuonSachId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface TheoDoiMuonSachRepository extends JpaRepository<TheoDoiMuonSach, TheoDoiMuonSachId> {
    List<TheoDoiMuonSach> findByDocGia_MaDocGia(String maDocGia);
    
    // Thêm phương thức phân trang
    Page<TheoDoiMuonSach> findByDocGia_MaDocGia(String maDocGia, Pageable pageable);
    
    List<TheoDoiMuonSach> findByTrangThaiMuon(TheoDoiMuonSach.TrangThaiMuon trangThaiMuon);
    boolean existsBySach_MaSachAndTrangThaiMuonIn(String maSach, List<TrangThaiMuon> trangThais);
    
    // Thêm method kiểm tra phiếu mượn của độc giả với sách cụ thể
    @Query("SELECT t FROM TheoDoiMuonSach t WHERE t.docGia.maDocGia = :maDocGia AND t.sach.maSach = :maSach AND t.trangThaiMuon IN :trangThais ORDER BY t.id.ngayMuon DESC")
    List<TheoDoiMuonSach> findByDocGiaAndSachAndTrangThaiMuonIn(
        @Param("maDocGia") String maDocGia, 
        @Param("maSach") String maSach, 
        @Param("trangThais") List<TrangThaiMuon> trangThais
    );
    
    // Tìm phiếu mượn gần nhất của độc giả với sách cụ thể
    @Query("SELECT t FROM TheoDoiMuonSach t WHERE t.docGia.maDocGia = :maDocGia AND t.sach.maSach = :maSach ORDER BY t.id.ngayMuon DESC")
    List<TheoDoiMuonSach> findLatestByDocGiaAndSach(@Param("maDocGia") String maDocGia, @Param("maSach") String maSach);
}