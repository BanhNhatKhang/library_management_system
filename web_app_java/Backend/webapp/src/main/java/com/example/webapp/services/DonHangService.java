package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Optional;

@Service
public class DonHangService {

    @Autowired
    private DonHangRepository donHangRepository;
    @Autowired
    private DocGiaRepository docGiaRepository;
    @Autowired
    private UuDaiRepository uuDaiRepository;

    public List<DonHang> getAllDonHang() {
        return donHangRepository.findAll();
    }

    public Optional<DonHang> getDonHangById(String maDonHang) {
        return donHangRepository.findById(maDonHang);
    }

    public List<DonHang> getDonHangByMaDocGia(String maDocGia) {
        return donHangRepository.findByDocGia_MaDocGia(maDocGia);
    }

    public List<DonHang> getDonHangByTenDocGia(String hoLot, String ten) {
        return donHangRepository.findByDocGia_HoLotIgnoreCaseContainingAndDocGia_TenIgnoreCaseContaining(hoLot,ten);
    }

     public List<DonHang> getDonHangByDienThoai(String dienThoai) {
        return donHangRepository.findByDocGia_DienThoai(dienThoai);
    }

    public DonHang saveDonHang(DonHang donHang, String maDocGia, List<String> maUuDaiList) {
        DocGia docGia = docGiaRepository.findById(maDocGia)
            .orElseThrow(() -> new RuntimeException("Độc giả không tồn tại"));
        donHang.setDocGia(docGia);

        Set<UuDai> uuDais = new HashSet<>();
        for (String maUuDai : maUuDaiList) {
            UuDai uuDai = uuDaiRepository.findById(maUuDai)
                .orElseThrow(() -> new RuntimeException("Ưu đãi không tồn tại"));
            uuDais.add(uuDai);
        }
        donHang.setUuDais(uuDais);
        return donHangRepository.save(donHang);
    }

    public DonHang updateDonHang(String maDonHang, DonHang donHang) {
        if (!donHangRepository.existsByMaDonHang(maDonHang)) {
            throw new RuntimeException("đơn hàng không hợp lệ không tồn tại");
        }
        donHang.setMaDonHang(maDonHang);
        return donHangRepository.save(donHang);     
    }

    public void deleteDonHang(String maDonHang) {
        donHangRepository.deleteById(maDonHang);
    }

}