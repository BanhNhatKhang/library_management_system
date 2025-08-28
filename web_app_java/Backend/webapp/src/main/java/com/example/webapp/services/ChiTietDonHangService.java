package com.example.webapp.services;

import com.example.webapp.models.ChiTietDonHang;
import com.example.webapp.models.ChiTietDonHangId;
import com.example.webapp.dto.ChiTietDonHangDTO;
import com.example.webapp.repository.ChiTietDonHangRepository;
import com.example.webapp.repository.DonHangRepository;
import com.example.webapp.repository.SachRepository;
import com.example.webapp.models.DonHang;
import com.example.webapp.models.Sach;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChiTietDonHangService {

    @Autowired
    private ChiTietDonHangRepository chiTietDonHangRepository;

    @Autowired
    private DonHangRepository donHangRepository;

    @Autowired
    private SachRepository sachRepository;

    public List<ChiTietDonHangDTO> getAllChiTietDonHang() {
        return chiTietDonHangRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }


    public Optional<ChiTietDonHangDTO> getChiTietDonHangById(ChiTietDonHangId id) {
        return chiTietDonHangRepository.findById(id).map(this::toDTO);
    }


    public List<ChiTietDonHangDTO> getChiTietByMaDonHang(String maDonHang) {
        return chiTietDonHangRepository.findByDonHang_MaDonHang(maDonHang).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ChiTietDonHangDTO> getChiTietByMaSach(String maSach) {
        return chiTietDonHangRepository.findBySach_MaSach(maSach).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ChiTietDonHangDTO getTongTienByMaDonHang(String maDonHang) {
        BigDecimal tongTien = chiTietDonHangRepository.calculateTotalByDonHang(maDonHang);
        return new ChiTietDonHangDTO(maDonHang, tongTien != null ? tongTien : BigDecimal.ZERO);
    }

    public List<ChiTietDonHangDTO> getTopSachBanChay() {
        List<Object[]> results = chiTietDonHangRepository.findTopSachBanChay();
        return results.stream()
                .map(row -> new ChiTietDonHangDTO((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());
    }

    public ChiTietDonHangDTO saveChiTietDonHang(ChiTietDonHangDTO chiTietDonHangDTO) {
        DonHang donHang = donHangRepository.findById(chiTietDonHangDTO.getMaDonHang())
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        Sach sach = sachRepository.findById(chiTietDonHangDTO.getMaSach())
                .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));

        ChiTietDonHang chiTietDonHang = new ChiTietDonHang();
        chiTietDonHang.setId(new ChiTietDonHangId(chiTietDonHangDTO.getMaDonHang(), chiTietDonHangDTO.getMaSach()));
        chiTietDonHang.setDonHang(donHang);
        chiTietDonHang.setSach(sach);
        chiTietDonHang.setSoLuong(chiTietDonHangDTO.getSoLuong());
        chiTietDonHang.setDonGia(chiTietDonHangDTO.getDonGia());

        chiTietDonHangRepository.save(chiTietDonHang);

        if (chiTietDonHang.getSoLuong() != null && chiTietDonHang.getDonGia() != null) {
            BigDecimal tongTien = chiTietDonHang.getDonGia()
                    .multiply(BigDecimal.valueOf(chiTietDonHang.getSoLuong()));
            chiTietDonHangDTO.setTongTien(tongTien);
            chiTietDonHangDTO.setTongSoLuong((long) chiTietDonHang.getSoLuong());
        }

        return chiTietDonHangDTO;
    }


    public ChiTietDonHang updateChiTietDonHang(ChiTietDonHangId id, ChiTietDonHang chiTietDonHang) {
        ChiTietDonHang existing = chiTietDonHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chi tiết đơn hàng không tồn tại"));

        existing.setSoLuong(chiTietDonHang.getSoLuong());
        existing.setDonGia(chiTietDonHang.getDonGia());
        return chiTietDonHangRepository.save(existing);
    }

    public void deleteChiTietDonHang(ChiTietDonHangId id) {
        chiTietDonHangRepository.deleteById(id);
    }

    public ChiTietDonHangDTO toDTO(ChiTietDonHang chiTietDonHang) {
        ChiTietDonHangDTO chiTietDonHangDTO = new ChiTietDonHangDTO();
        chiTietDonHangDTO.setMaDonHang(chiTietDonHang.getDonHang().getMaDonHang());
        chiTietDonHangDTO.setMaSach(chiTietDonHang.getSach().getMaSach());
        chiTietDonHangDTO.setSoLuong(chiTietDonHang.getSoLuong());
        chiTietDonHangDTO.setDonGia(chiTietDonHang.getDonGia());
        return chiTietDonHangDTO;
    }

    public ChiTietDonHang toEntity(ChiTietDonHangDTO chiTietDonHangDTO) {
        ChiTietDonHang chiTietDonHang = new ChiTietDonHang();
        ChiTietDonHangId id = new ChiTietDonHangId(chiTietDonHangDTO.getMaDonHang(), chiTietDonHangDTO.getMaSach());
        chiTietDonHang.setId(id);
        chiTietDonHang.setSoLuong(chiTietDonHangDTO.getSoLuong());
        chiTietDonHang.setDonGia(chiTietDonHangDTO.getDonGia());

        
        DonHang donHang = donHangRepository.findById(chiTietDonHangDTO.getMaDonHang())
            .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        chiTietDonHang.setDonHang(donHang);

        Sach sach = sachRepository.findById(chiTietDonHangDTO.getMaSach())
            .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));
        chiTietDonHang.setSach(sach);

        return chiTietDonHang;
    }
}
