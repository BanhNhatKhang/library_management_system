package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.dto.SachDTO;
import com.example.webapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Optional;

@Service
public class SachService {

    @Autowired
    private SachRepository sachRepository;
    @Autowired
    private NhaXuatBanRepository nhaXuatBanRepository;
    @Autowired
    private TheLoaiRepository theLoaiRepository;

    public List<SachDTO> getAllSach() {
        return sachRepository.findAll().stream().map(this::toDTO).toList();
    }

    public Optional<SachDTO> getSachById(String maSach) {
        return sachRepository.findByMaSach(maSach).map(this::toDTO);
    }

    public Optional<SachDTO> getSachByTen(String tenSach) {
        return sachRepository.findByTenSach(tenSach).map(this::toDTO);
    }

    public List<SachDTO> getSachByTacGia(String tacGia) {
        return sachRepository.findByTacGia(tacGia).stream().map(this::toDTO).toList();
    }

    public List<SachDTO> getSachByNhaXuatBan(String tenNhaXuatBan) {
        return sachRepository.findByNhaXuatBan_TenNhaXuatBan(tenNhaXuatBan).stream().map(this::toDTO).toList();
    }

    public Sach saveSach(Sach sach, String maNhaXuatBan, List<String> maTheLoaiList) {      
        NhaXuatBan nxb = nhaXuatBanRepository.findById(maNhaXuatBan)
            .orElseThrow(() -> new RuntimeException("Nhà xuất bản không tồn tại"));
        sach.setNhaXuatBan(nxb);
            
        Set<TheLoai> theLoais = new HashSet<>();
        for (String maTheLoai : maTheLoaiList) {
            TheLoai tl = theLoaiRepository.findById(maTheLoai)
                .orElseThrow(() -> new RuntimeException("Thể loại không tồn tại"));
            theLoais.add(tl);
        }
        sach.setTheLoais(theLoais);

        return sachRepository.save(sach);
    }

    public Sach updateSach(String maSach, Sach Sach) {
        if (!sachRepository.existsById(maSach) || !sachRepository.existsByTenSach(Sach.getTenSach())) {
            throw new RuntimeException("Thông tin ưu đãi không hợp lệ hoặc không tồn tại");
        }
        Sach.setMaSach(maSach);
        return sachRepository.save(Sach);
    }

    public void deleteSach(String maSach) {
        sachRepository.deleteById(maSach);
    }

    public SachDTO toDTO(Sach sach) {
        SachDTO dto = new SachDTO();
        dto.setMaSach(sach.getMaSach());
        dto.setTenSach(sach.getTenSach());
        dto.setSoQuyen(sach.getSoQuyen());
        dto.setDonGia(sach.getDonGia());
        dto.setSoLuong(sach.getSoLuong());
        dto.setNamXuatBan(sach.getNamXuatBan());
        dto.setTacGia(sach.getTacGia());
        dto.setMoTa(sach.getMoTa());
        dto.setAnhBia(sach.getAnhBia());
        dto.setDiemDanhGia(sach.getDiemDanhGia());
        dto.setGiamGia(sach.getGiamGia());
        dto.setNhaXuatBan(sach.getNhaXuatBan() != null ? sach.getNhaXuatBan().getTenNhaXuatBan() : null);
        dto.setTheLoais(sach.getTheLoais().stream().map(TheLoai::getTenTheLoai).toList());
        return dto;
    }

    public Sach toEntity(SachDTO dto) {
        Sach sach = new Sach();
        sach.setMaSach(dto.getMaSach());
        sach.setTenSach(dto.getTenSach());
        sach.setSoQuyen(dto.getSoQuyen());
        sach.setDonGia(dto.getDonGia());
        sach.setSoLuong(dto.getSoLuong());
        sach.setNamXuatBan(dto.getNamXuatBan());
        sach.setTacGia(dto.getTacGia());
        sach.setMoTa(dto.getMoTa());
        sach.setAnhBia(dto.getAnhBia());
        sach.setDiemDanhGia(dto.getDiemDanhGia());
        sach.setGiamGia(dto.getGiamGia());
        return sach;
    }
}