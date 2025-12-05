package com.example.webapp.repository;

import com.example.webapp.models.PhatDocGia;
import com.example.webapp.models.TheoDoiMuonSach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PhatDocGiaRepository extends JpaRepository<PhatDocGia, Long> {
    
    List<PhatDocGia> findByTheoDoiMuonSach_DocGia_MaDocGia(String maDocGia);
    
    List<PhatDocGia> findByTrangThaiPhat(PhatDocGia.TrangThaiPhat trangThaiPhat);
    
    Optional<PhatDocGia> findByTheoDoiMuonSach(TheoDoiMuonSach theoDoiMuonSach);
    
    boolean existsByTheoDoiMuonSach(TheoDoiMuonSach theoDoiMuonSach);
    
    @Query("SELECT COUNT(p) > 0 FROM PhatDocGia p WHERE " +
           "p.theoDoiMuonSach.id.maDocGia = :maDocGia AND " +
           "p.theoDoiMuonSach.id.maSach = :maSach AND " +
           "p.theoDoiMuonSach.id.ngayMuon = :ngayMuon")
    boolean existsByTheoDoiMuonSachIds(@Param("maDocGia") String maDocGia, 
                                      @Param("maSach") String maSach, 
                                      @Param("ngayMuon") LocalDate ngayMuon);
    
    List<PhatDocGia> findByTheoDoiMuonSach_Id_MaDocGiaAndTheoDoiMuonSach_Id_MaSachAndTheoDoiMuonSach_Id_NgayMuon(
        String maDocGia, String maSach, LocalDate ngayMuon);
    
    @Query("SELECT COUNT(p) FROM PhatDocGia p WHERE p.theoDoiMuonSach.docGia.maDocGia = :maDocGia AND p.trangThaiPhat = 'CHUATHANHTOAN'")
    long countUnpaidFinesByDocGia(@Param("maDocGia") String maDocGia);
    
    @Query("SELECT SUM(p.soTienPhat) FROM PhatDocGia p WHERE p.theoDoiMuonSach.docGia.maDocGia = :maDocGia AND p.trangThaiPhat = 'CHUATHANHTOAN'")
    java.math.BigDecimal getTotalUnpaidFinesByDocGia(@Param("maDocGia") String maDocGia);
}