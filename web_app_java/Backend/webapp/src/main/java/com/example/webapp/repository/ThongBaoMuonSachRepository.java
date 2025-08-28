package com.example.webapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.webapp.models.*;
import java.util.List;

public interface ThongBaoMuonSachRepository extends JpaRepository<ThongBaoMuonSach, Long> {

    List<ThongBaoMuonSach> findByTheoDoiMuonSach_Id_MaDocGia(String maDocGia);
    List<ThongBaoMuonSach> findByTrangThaiDaDoc(Boolean trangThaiDaDoc);
    List<ThongBaoMuonSach> findByLoaiThongBao(ThongBaoMuonSach.LoaiThongBao loaiThongBao);
    List<ThongBaoMuonSach> findByTheoDoiMuonSach_Id_MaSach(String maSach);
    List<ThongBaoMuonSach> findByTheoDoiMuonSach_Id_MaDocGiaAndTrangThaiDaDoc(String maDocGia, Boolean trangThaiDaDoc);
    void deleteByTheoDoiMuonSach_Id_MaDocGia(String maDocGia);
}