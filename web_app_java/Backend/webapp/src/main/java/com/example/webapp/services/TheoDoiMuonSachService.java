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

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
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
        // 1. Xử lý Mã Độc Giả (MaDocGia / Email)
        String docGiaIdentifier = theoDoiMuonSachDTO.getMaDocGia();
        DocGia docGia;

        if (docGiaIdentifier != null && docGiaIdentifier.startsWith("DG")) {
            // Trường hợp là Mã DocGia: Tìm theo ID
            docGia = docGiaRepository.findById(docGiaIdentifier)
                .orElseThrow(() -> new RuntimeException("Độc giả không tồn tại (ID: " + docGiaIdentifier + ")"));
        } else {
            // Trường hợp là Email (Subject): Tìm theo Email
            // PHẢI ĐẢM BẢO docGiaRepository CÓ PHƯƠNG THỨC findByEmail(String email)
            docGia = docGiaRepository.findByEmail(docGiaIdentifier); 
            if (docGia == null) {
                throw new RuntimeException("Độc giả không tồn tại (Email: " + docGiaIdentifier + ")");
            }
        }

        // Lấy Mã Độc Giả thực tế để tạo ID
        String maDocGiaThucTe = docGia.getMaDocGia();
        
        // 2. Kiểm tra sách
        Sach sach = sachRepository.findById(theoDoiMuonSachDTO.getMaSach())
            .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));

        // 3. Xử lý Nhân viên (luôn là null khi độc giả tạo phiếu)
        NhanVien nhanVien = null; 
        if (theoDoiMuonSachDTO.getMaNhanVien() != null && !theoDoiMuonSachDTO.getMaNhanVien().isEmpty()) {
             nhanVien = nhanVienRepository.findById(theoDoiMuonSachDTO.getMaNhanVien())
                 .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));
        }

        // 4. Tính Ngày Trả (Ngay Muon + 14 ngày)
        LocalDate ngayMuon = theoDoiMuonSachDTO.getNgayMuon();
        if (ngayMuon == null) {
             throw new RuntimeException("Ngày mượn không được để trống!");
        }
        // Tính ngày trả dự kiến
        LocalDate ngayTraDuKien = ngayMuon.plus(14, ChronoUnit.DAYS); // Thêm 14 ngày
        
        // 5. Tạo ID và kiểm tra trùng lặp (dùng NgayMuon từ DTO, MaDocGia thực tế)
        TheoDoiMuonSachId id = new TheoDoiMuonSachId(
            maDocGiaThucTe, 
            theoDoiMuonSachDTO.getMaSach(), 
            ngayMuon // Sử dụng Ngay Muon đã kiểm tra
        );
        
        if (theoDoiMuonSachRepository.findById(id).isPresent()) {
             throw new RuntimeException("Yêu cầu mượn cho sách này của độc giả vào ngày này đã tồn tại!");
        }

        // 6. Tạo và lưu Entity
        TheoDoiMuonSach theoDoiMuonSach = new TheoDoiMuonSach();
        theoDoiMuonSach.setId(id);
        theoDoiMuonSach.setDocGia(docGia);
        theoDoiMuonSach.setSach(sach);
        theoDoiMuonSach.setNhanVien(nhanVien); // null
        
        // Gán Ngày Trả đã tính toán
        theoDoiMuonSach.setNgayTra(ngayTraDuKien); 
        
        // Gán trạng thái 
        String trangThaiString = theoDoiMuonSachDTO.getTrangThaiMuon();
        if (trangThaiString == null) {
            trangThaiString = "CHODUYET"; // Đảm bảo trạng thái mặc định
        }
        theoDoiMuonSach.setTrangThaiMuon(TheoDoiMuonSach.TrangThaiMuon.valueOf(trangThaiString));

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

    @SuppressWarnings("unused") // tắt cảnh báo 
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