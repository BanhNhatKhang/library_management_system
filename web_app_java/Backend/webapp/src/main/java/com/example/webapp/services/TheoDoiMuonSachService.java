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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
        List<TheoDoiMuonSach> theoDoiList = theoDoiMuonSachRepository.findByDocGia_MaDocGia(maDocGia);
        return theoDoiList.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public Optional<TheoDoiMuonSach> findById(TheoDoiMuonSachId id) {
        return theoDoiMuonSachRepository.findById(id);
    }

    public TheoDoiMuonSach update(TheoDoiMuonSach theoDoiMuonSach) {
        return theoDoiMuonSachRepository.save(theoDoiMuonSach);
    }

    public TheoDoiMuonSachDTO convertToDTO(TheoDoiMuonSach theoDoiMuonSach) {
        if (theoDoiMuonSach == null) {
            return null;
        }

        TheoDoiMuonSachDTO dto = new TheoDoiMuonSachDTO();
        dto.setMaDocGia(theoDoiMuonSach.getId().getMaDocGia());
        dto.setMaSach(theoDoiMuonSach.getId().getMaSach());
        dto.setNgayMuon(theoDoiMuonSach.getId().getNgayMuon());
        dto.setNgayTra(theoDoiMuonSach.getNgayTra());
        dto.setTrangThaiMuon(theoDoiMuonSach.getTrangThaiMuon().name());
        
        // SỬA: Gọi private method để map nested objects
        if (theoDoiMuonSach.getDocGia() != null) {
            DocGiaDTO docGiaDTO = toDocGiaDTO(theoDoiMuonSach.getDocGia());
            dto.setDocGia(docGiaDTO);
            System.out.println("convertToDTO - DocGia mapped: " + (docGiaDTO != null ? docGiaDTO.getMaDocGia() : "null"));
        } else {
            System.out.println("convertToDTO - DocGia is null in entity");
        }
        
        if (theoDoiMuonSach.getSach() != null) {
            SachDTO sachDTO = toSachDTO(theoDoiMuonSach.getSach());
            dto.setSach(sachDTO);
            System.out.println("convertToDTO - Sach mapped: " + (sachDTO != null ? sachDTO.getMaSach() : "null"));
        } else {
            System.out.println("convertToDTO - Sach is null in entity");
        }
        
        // Handle NhanVien
        if (theoDoiMuonSach.getNhanVien() != null) {
            dto.setMaNhanVien(theoDoiMuonSach.getNhanVien().getMaNhanVien());
            dto.setTenNhanVien(theoDoiMuonSach.getNhanVien().getHoTenNV());
        }
        
        return dto;
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

    public Page<TheoDoiMuonSachDTO> getByMaDocGiaPaginated(String maDocGia, Pageable pageable) {
        Page<TheoDoiMuonSach> theoDoiPage = theoDoiMuonSachRepository.findByDocGia_MaDocGia(maDocGia, pageable);
        return theoDoiPage.map(this::toDTO);
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
            String tenNhanVien = theoDoiMuonSach.getNhanVien().getHoTenNV();
            theoDoiMuonSachDTO.setTenNhanVien(tenNhanVien);
        }
        
        // SỬA: Đảm bảo docGia và sach được set với proper mapping
        if (theoDoiMuonSach.getDocGia() != null) {
            DocGiaDTO docGiaDTO = toDocGiaDTO(theoDoiMuonSach.getDocGia());
            theoDoiMuonSachDTO.setDocGia(docGiaDTO); 
            System.out.println("DocGia DTO created: " + docGiaDTO.getMaDocGia() + " - " + docGiaDTO.getTen()); // Debug log
        } else {
            System.out.println("DocGia is null!"); // Debug log
        }
        
        if (theoDoiMuonSach.getSach() != null) {
            SachDTO sachDTO = toSachDTO(theoDoiMuonSach.getSach());
            theoDoiMuonSachDTO.setSach(sachDTO); 
            System.out.println("Sach DTO created: " + sachDTO.getMaSach() + " - " + sachDTO.getTenSach()); // Debug log
        } else {
            System.out.println("Sach is null!"); // Debug log
        }

        return theoDoiMuonSachDTO;
    }

    // SỬA: Fix toDocGiaDTO method với đầy đủ field mapping
    private DocGiaDTO toDocGiaDTO(DocGia docGia) {
        if (docGia == null) {
            System.out.println("DocGia entity is null in toDocGiaDTO");
            return null;
        }

        DocGiaDTO dto = new DocGiaDTO();
        dto.setMaDocGia(docGia.getMaDocGia());
        dto.setHoLot(docGia.getHoLot()); 
        dto.setTen(docGia.getTen());
        dto.setDienThoai(docGia.getDienThoai());
        dto.setEmail(docGia.getEmail());
        dto.setDiaChi(docGia.getDiaChi());
        dto.setNgaySinh(docGia.getNgaySinh());
        
        // SỬA: Convert enum to String cho gioiTinh
        if (docGia.getGioiTinh() != null) {
            dto.setGioiTinh(docGia.getGioiTinh().name());
        }
        if (docGia.getVaiTro() != null) {
            dto.setVaiTro(docGia.getVaiTro().name());
        }
        if (docGia.getTrangThai() != null) {
            dto.setTrangThai(docGia.getTrangThai().name());
        }
        
        // SỬA: Thêm debug để kiểm tra dữ liệu
        System.out.println("Mapping DocGia: " + docGia.getMaDocGia() + 
                          ", Ten: " + docGia.getTen() + 
                          ", Email: " + docGia.getEmail() + 
                          ", DienThoai: " + docGia.getDienThoai());
        
        return dto;
    }

    // SỬA: toSachDTO method với type conversion đúng
    private SachDTO toSachDTO(Sach sach) {
        if (sach == null) {
            System.out.println("Sach entity is null in toSachDTO");
            return null;
        }

        SachDTO dto = new SachDTO();
        dto.setMaSach(sach.getMaSach());
        dto.setTenSach(sach.getTenSach()); 
        dto.setTacGia(sach.getTacGia());
        dto.setAnhBia(sach.getAnhBia());
        dto.setSoQuyen(sach.getSoQuyen());
        dto.setDonGia(sach.getDonGia());
        dto.setSoLuong(sach.getSoLuong());
        
        // SỬA: LocalDate → LocalDate (no conversion needed)
        dto.setNamXuatBan(sach.getNamXuatBan());
        
        dto.setMoTa(sach.getMoTa());
        
        // SỬA: Double → Double (no conversion needed)
        dto.setDiemDanhGia(sach.getDiemDanhGia());
        dto.setGiamGia(sach.getGiamGia());
        
        // SỬA: Xử lý theLoais safely
        if (sach.getTheLoais() != null && !sach.getTheLoais().isEmpty()) {
            dto.setTheLoais(sach.getTheLoais().stream()
                .map(TheLoai::getTenTheLoai)
                .toList());
        } else {
            dto.setTheLoais(List.of()); // Empty list thay vì null
        }
        
        // SỬA: Xử lý nhaXuatBan safely  
        if (sach.getNhaXuatBan() != null) {
            dto.setNhaXuatBan(sach.getNhaXuatBan().getTenNhaXuatBan());
        }
        
        // SỬA: Thêm debug để kiểm tra dữ liệu
        System.out.println("Mapping Sach: " + sach.getMaSach() + 
                          ", TenSach: " + sach.getTenSach() + 
                          ", TacGia: " + sach.getTacGia() + 
                          ", TheLoais count: " + (sach.getTheLoais() != null ? sach.getTheLoais().size() : 0));
        
        return dto;
    }
}