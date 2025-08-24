package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.dto.DonHangDTO;
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

    public List<DonHangDTO> getAllDonHang() {
        return donHangRepository.findAll().stream().map(this::toDTO).toList();
    }

    public Optional<DonHangDTO> getDonHangById(String maDonHang) {
        return donHangRepository.findById(maDonHang).map(this::toDTO);
    }

    public List<DonHangDTO> getDonHangByMaDocGia(String maDocGia) {
        return donHangRepository.findByDocGia_MaDocGia(maDocGia).stream().map(this::toDTO).toList();
    }

    public List<DonHangDTO> getDonHangByTenDocGia(String hoLot, String ten) {
        return donHangRepository.findByDocGia_HoLotIgnoreCaseContainingAndDocGia_TenIgnoreCaseContaining(hoLot,ten).stream().map(this::toDTO).toList();
    }

     public List<DonHangDTO> getDonHangByDienThoai(String dienThoai) {
        return donHangRepository.findByDocGia_DienThoai(dienThoai).stream().map(this::toDTO).toList();
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
        DonHang existing = donHangRepository.findById(maDonHang)
            .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        
        existing.setNgayDat(donHang.getNgayDat());
        existing.setTongTien(donHang.getTongTien());
        existing.setTrangThai(donHang.getTrangThai());

        return donHangRepository.save(existing);     
    }

    public void deleteDonHang(String maDonHang) {
        donHangRepository.deleteById(maDonHang);
    }

    public DonHangDTO toDTO(DonHang donHang) {
        DonHangDTO donHangDTO = new DonHangDTO();
        donHangDTO.setMaDonHang(donHang.getMaDonHang());
        donHangDTO.setMaDocGia(donHang.getDocGia().getMaDocGia());
        donHangDTO.setNgayDat(donHang.getNgayDat());
        donHangDTO.setTongTien(donHang.getTongTien());
        donHangDTO.setTrangThaiDonHang(donHang.getTrangThai());
        return donHangDTO;
    }

    public DonHang toEntity(DonHangDTO donHangDTO) {
        DonHang donHang = new DonHang();
        donHang.setMaDonHang(donHangDTO.getMaDonHang());
        donHang.setNgayDat(donHangDTO.getNgayDat());
        donHang.setTongTien(donHangDTO.getTongTien());
        donHang.setTrangThai(donHangDTO.getTrangThaiDonHang());
        return donHang;
    }

}