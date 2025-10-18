package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.dto.DocGiaDTO;
import com.example.webapp.dto.SachDTO;
import com.example.webapp.dto.TheoDoiMuonSachDTO;
import com.example.webapp.repository.DocGiaRepository;
import com.example.webapp.repository.NhanVienRepository;
import com.example.webapp.repository.SachRepository;
import com.example.webapp.repository.TheoDoiMuonSachRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TheoDoiMuonSachService {

    @Autowired
    private TheoDoiMuonSachRepository theoDoiMuonSachRepository;

    @Autowired
    private DocGiaRepository docGiaRepository;

    @Autowired
    private SachRepository sachRepository;

    @Autowired
    private NhanVienRepository nhanVienRepository;

    public List<TheoDoiMuonSachDTO> getAll() {
        return theoDoiMuonSachRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TheoDoiMuonSachDTO> getByMaDocGia(String maDocGia) {
        return theoDoiMuonSachRepository.findByDocGia_MaDocGia(maDocGia).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<TheoDoiMuonSach> findById(TheoDoiMuonSachId id) {
        return theoDoiMuonSachRepository.findById(id);
    }

    public Optional<TheoDoiMuonSachDTO> getById(TheoDoiMuonSachId id) {
        return theoDoiMuonSachRepository.findById(id).map(this::toDTO);
    }

    public List<TheoDoiMuonSachDTO> getByMaSach(String maSach) {
        return theoDoiMuonSachRepository.findAll().stream()
            .filter(tdms -> tdms.getSach().getMaSach().equals(maSach))
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public TheoDoiMuonSachDTO save(TheoDoiMuonSachDTO theoDoiMuonSachDTO) {
        TheoDoiMuonSach theoDoiMuonSach = toEntity(theoDoiMuonSachDTO);
        DocGia docGia = docGiaRepository.findById(theoDoiMuonSachDTO.getMaDocGia())
            .orElseThrow(() -> new RuntimeException("Độc giả không tồn tại"));
        
        Sach sach = sachRepository.findById(theoDoiMuonSachDTO.getMaSach())
            .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));

        NhanVien nhanVien = nhanVienRepository.findById(theoDoiMuonSachDTO.getMaNhanVien())
            .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));

        theoDoiMuonSach.setDocGia(docGia);
        theoDoiMuonSach.setSach(sach);
        theoDoiMuonSach.setNhanVien(nhanVien);

        TheoDoiMuonSachId id = new TheoDoiMuonSachId(
            theoDoiMuonSachDTO.getMaDocGia(), 
            theoDoiMuonSachDTO.getMaSach(), 
            theoDoiMuonSachDTO.getNgayMuon()
        );

        theoDoiMuonSach.setId(id);

        theoDoiMuonSach.setNgayTra(theoDoiMuonSachDTO.getNgayTra());
        theoDoiMuonSach.setTrangThaiMuon(TheoDoiMuonSach.TrangThaiMuon.valueOf(theoDoiMuonSachDTO.getTrangThaiMuon()));

        TheoDoiMuonSach saved = theoDoiMuonSachRepository.save(theoDoiMuonSach);
        return toDTO(saved);
    }

    public TheoDoiMuonSachDTO update(TheoDoiMuonSachDTO theoDoiMuonSachDTO) {
        TheoDoiMuonSachId id = new TheoDoiMuonSachId(
            theoDoiMuonSachDTO.getMaDocGia(), 
            theoDoiMuonSachDTO.getMaSach(), 
            theoDoiMuonSachDTO.getNgayMuon()
        );

        // 1. Tìm Entity hiện có
        TheoDoiMuonSach existingRecord = theoDoiMuonSachRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy bản ghi để cập nhật"));

        // 2. Cập nhật các trường được phép thay đổi từ DTO
        
        if (theoDoiMuonSachDTO.getNgayTra() != null) {
            existingRecord.setNgayTra(theoDoiMuonSachDTO.getNgayTra());
        }
        
        if (theoDoiMuonSachDTO.getTrangThaiMuon() != null) {
            existingRecord.setTrangThaiMuon(TheoDoiMuonSach.TrangThaiMuon.valueOf(theoDoiMuonSachDTO.getTrangThaiMuon()));
        }
        
        if (theoDoiMuonSachDTO.getMaNhanVien() != null) {
            NhanVien nhanVien = nhanVienRepository.findById(theoDoiMuonSachDTO.getMaNhanVien())
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));
            existingRecord.setNhanVien(nhanVien);
        } 
        // 3. Lưu Entity đã cập nhật
        return toDTO(theoDoiMuonSachRepository.save(existingRecord));
    }

    public void delete(TheoDoiMuonSachId id) {
        theoDoiMuonSachRepository.deleteById(id);
    }

    private TheoDoiMuonSachDTO toDTO(TheoDoiMuonSach theoDoiMuonSach) {
        TheoDoiMuonSachDTO theoDoiMuonSachDTO = new TheoDoiMuonSachDTO();
        
        theoDoiMuonSachDTO.setMaDocGia(theoDoiMuonSach.getId().getMaDocGia());
        theoDoiMuonSachDTO.setMaSach(theoDoiMuonSach.getId().getMaSach());
        
        theoDoiMuonSachDTO.setNgayMuon(theoDoiMuonSach.getId().getNgayMuon());
        theoDoiMuonSachDTO.setNgayTra(theoDoiMuonSach.getNgayTra());
        theoDoiMuonSachDTO.setTrangThaiMuon(theoDoiMuonSach.getTrangThaiMuon().name());

        if (theoDoiMuonSach.getNhanVien() != null) {
            theoDoiMuonSachDTO.setMaNhanVien(theoDoiMuonSach.getNhanVien().getMaNhanVien()); 
        }
        
        if (theoDoiMuonSach.getDocGia() != null) {
            theoDoiMuonSachDTO.setDocGia(toDocGiaDTO(theoDoiMuonSach.getDocGia())); 
        }
        if (theoDoiMuonSach.getSach() != null) {
            theoDoiMuonSachDTO.setSach(toSachDTO(theoDoiMuonSach.getSach())); 
        }

        return theoDoiMuonSachDTO;
    }

    private TheoDoiMuonSach toEntity(TheoDoiMuonSachDTO theoDoiMuonSachDTO) {
        TheoDoiMuonSach theoDoiMuonSach = new TheoDoiMuonSach();
        TheoDoiMuonSachId id = new TheoDoiMuonSachId(theoDoiMuonSachDTO.getMaDocGia(), theoDoiMuonSachDTO.getMaSach(), theoDoiMuonSachDTO.getNgayMuon());
        theoDoiMuonSach.setId(id);
        theoDoiMuonSach.setNgayTra(theoDoiMuonSachDTO.getNgayTra());
        theoDoiMuonSach.setTrangThaiMuon(TheoDoiMuonSach.TrangThaiMuon.valueOf(theoDoiMuonSachDTO.getTrangThaiMuon()));
        return theoDoiMuonSach;
    }

    private DocGiaDTO toDocGiaDTO(DocGia docGia) {
        DocGiaDTO dto = new DocGiaDTO();
        dto.setMaDocGia(docGia.getMaDocGia());
        dto.setHoLot(docGia.getHoLot()); 
        dto.setTen(docGia.getTen());
        dto.setDienThoai(docGia.getDienThoai());
        dto.setEmail(docGia.getEmail());
        dto.setDiaChi(docGia.getDiaChi());
        dto.setNgaySinh(docGia.getNgaySinh());
        return dto;
    }

    private SachDTO toSachDTO(Sach sach) {
        SachDTO dto = new SachDTO();
        dto.setMaSach(sach.getMaSach());
        dto.setTenSach(sach.getTenSach()); 
        dto.setTacGia(sach.getTacGia());
        dto.setTheLoais(sach.getTheLoais().stream().map(TheLoai::getTenTheLoai).toList());
        return dto;
    }

}