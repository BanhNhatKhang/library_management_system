package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.dto.*;
import com.example.webapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GioHangService {

    @Autowired
    private GioHangRepository gioHangRepository;

    @Autowired
    private DocGiaRepository docGiaRepository;

    @Autowired
    private SachRepository sachRepository;

    public List<GioHangDTO> getAllGioHangs() {
        return gioHangRepository.findAll().stream().map(this::toDTO).toList();
    }

    public Optional<GioHangDTO> getGioHangById(GioHangId id) {
        return gioHangRepository.findById(id).map(this::toDTO).map(Optional::of).orElseGet(() -> Optional.empty());
    }

    public List<GioHangDTO> getGioHangsByMaDocGia(String maDocGia) {
        return gioHangRepository.findByDocGia_MaDocGia(maDocGia).stream().map(this::toDTO).toList();
    }

    public GioHangDTO saveGioHang(GioHangDTO gioHangDTO) {
        GioHang gioHang = toEntity(gioHangDTO);
        GioHang saved = gioHangRepository.save(gioHang);
        return toDTO(saved);
    }

    public GioHangDTO updateGioHang(GioHangDTO gioHangDTO) {
        GioHangId id = new GioHangId(gioHangDTO.getMaDocGia(), gioHangDTO.getMaSach());
        GioHang gioHang = gioHangRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại"));

        gioHang.setSoLuong(gioHangDTO.getSoLuong()); 
        GioHang updated = gioHangRepository.save(gioHang);
        return toDTO(updated);
    }

    public void deleteGioHang(GioHangId id) {
        gioHangRepository.deleteById(id);
    }

    public void deleteAllGioHangByDocGia(String maDocGia) {
        gioHangRepository.deleteByDocGia_MaDocGia(maDocGia);
    }

    public boolean existsByMaGioHang(GioHangId id) {
        return gioHangRepository.existsById(id);
    }

    public GioHangDTO toDTO(GioHang gioHang) {
        GioHangDTO gioHangDTO = new GioHangDTO();
        gioHangDTO.setMaDocGia(gioHang.getId().getMaDocGia());
        gioHangDTO.setMaSach(gioHang.getId().getMaSach());
        gioHangDTO.setSoLuong(gioHang.getSoLuong());
        gioHangDTO.setNgayThem(gioHang.getNgayThem());
        return gioHangDTO;
    }

    public GioHang toEntity(GioHangDTO gioHangDTO) {
        GioHang gioHang = new GioHang();
        GioHangId id = new GioHangId(gioHangDTO.getMaDocGia(), gioHangDTO.getMaSach());
        gioHang.setId(id);
        gioHang.setSoLuong(gioHangDTO.getSoLuong());
        gioHang.setNgayThem(gioHangDTO.getNgayThem());

        DocGia docgia = docGiaRepository.findById(gioHangDTO.getMaDocGia())
            .orElseThrow(() -> new RuntimeException("Độc giả không tồn tại"));
        gioHang.setDocGia(docgia);

        Sach sach = sachRepository.findById(gioHangDTO.getMaSach())
            .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));
        gioHang.setSach(sach);
        return gioHang;
    }
}