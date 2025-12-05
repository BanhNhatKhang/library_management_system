package com.example.webapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.webapp.models.*;
import java.util.List;
import java.time.LocalDateTime;

public interface ThongBaoMuonSachRepository extends JpaRepository<ThongBaoMuonSach, Long> {

    List<ThongBaoMuonSach> findByTheoDoiMuonSach_Id_MaDocGia(String maDocGia);
     List<ThongBaoMuonSach> findByTheoDoiMuonSach_DocGia_MaDocGiaOrderByThoiGianGuiDesc(String maDocGia);
    List<ThongBaoMuonSach> findByTrangThaiDaDoc(Boolean trangThaiDaDoc);
    List<ThongBaoMuonSach> findByLoaiThongBao(ThongBaoMuonSach.LoaiThongBao loaiThongBao);
    List<ThongBaoMuonSach> findByTheoDoiMuonSach_Id_MaSach(String maSach);
    List<ThongBaoMuonSach> findByTheoDoiMuonSach_Id_MaDocGiaAndTrangThaiDaDoc(String maDocGia, Boolean trangThaiDaDoc);
    void deleteByTheoDoiMuonSach_Id_MaDocGia(String maDocGia);
    long countByTheoDoiMuonSach_DocGia_MaDocGiaAndTrangThaiDaDoc(String maDocGia, Boolean trangThaiDaDoc);

    List<ThongBaoMuonSach> findByTheoDoiMuonSach_Id_MaDocGiaAndTheoDoiMuonSach_Id_MaSachAndLoaiThongBao(
        String maDocGia, String maSach, ThongBaoMuonSach.LoaiThongBao loaiThongBao
    );

    List<ThongBaoMuonSach> findByTheoDoiMuonSach_Id_MaDocGiaAndTheoDoiMuonSach_Id_MaSachAndLoaiThongBaoAndThoiGianGuiAfter(
        String maDocGia, String maSach, ThongBaoMuonSach.LoaiThongBao loaiThongBao, LocalDateTime thoiGian
    );
}