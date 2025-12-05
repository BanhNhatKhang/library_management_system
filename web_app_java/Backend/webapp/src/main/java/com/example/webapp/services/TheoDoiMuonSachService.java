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

    @Autowired
    private SachService sachService; // SỬA: Thêm dependency SachService

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
            dto.setDocGia(toDocGiaDTO(theoDoiMuonSach.getDocGia()));
        } else {
            dto.setDocGia(null);
        }
        
        if (theoDoiMuonSach.getSach() != null) {
            dto.setSach(toSachDTO(theoDoiMuonSach.getSach()));
        } else {
            dto.setSach(null);
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

    // Thêm method kiểm tra trạng thái mượn
    public String checkBorrowStatus(String docGiaIdentifier, String maSach) {
        // 1. Kiểm tra số sách mượn còn lại trước
        int soSachMuonConLai = sachService.getAvailableBooksCount(maSach);
        if (soSachMuonConLai <= 0) {
            return "Sách đã được mượn hết, vui lòng quay lại sau.";
        }
        
        // 2. Xử lý Mã Độc Giả (MaDocGia / Email)
        DocGia docGia = null;
        
        if (docGiaIdentifier != null && docGiaIdentifier.startsWith("DG")) {
            // SỬA: Sửa lỗi type mismatch
            Optional<DocGia> docGiaOpt = docGiaRepository.findByMaDocGia(docGiaIdentifier);
            docGia = docGiaOpt.orElse(null);
        } else {
            // SỬA: Sửa lỗi type mismatch - findByEmail trả về DocGia, không phải Optional
            docGia = docGiaRepository.findByEmail(docGiaIdentifier);
        }
        
        if (docGia == null) {
            return "Không tìm thấy thông tin Độc Giả.";
        }
        
        String maDocGiaThucTe = docGia.getMaDocGia();
        
        // 3. Kiểm tra sách có tồn tại không
        Optional<Sach> sachOpt = sachRepository.findById(maSach);
        if (sachOpt.isEmpty()) {
            return "Sách không tồn tại.";
        }
        
        // 4. Tìm phiếu mượn có trạng thái "đang hoạt động" (không được mượn tiếp)
        List<TheoDoiMuonSach.TrangThaiMuon> activeStates = List.of(
            TheoDoiMuonSach.TrangThaiMuon.CHODUYET,
            TheoDoiMuonSach.TrangThaiMuon.DADUYET, 
            TheoDoiMuonSach.TrangThaiMuon.DANGMUON
        );
        
        List<TheoDoiMuonSach> activeRecords = theoDoiMuonSachRepository
            .findByDocGiaAndSachAndTrangThaiMuonIn(maDocGiaThucTe, maSach, activeStates);
            
        if (!activeRecords.isEmpty()) {
            TheoDoiMuonSach latestRecord = activeRecords.get(0);
            String trangThaiText = getTrangThaiText(latestRecord.getTrangThaiMuon());
            return "Bạn đã có phiếu mượn sách này với trạng thái: " + trangThaiText;
        }
        
        return null; // Cho phép mượn
    }
    
    // Helper method để chuyển enum thành text hiển thị
    private String getTrangThaiText(TheoDoiMuonSach.TrangThaiMuon trangThai) {
        switch (trangThai) {
            case CHODUYET:
                return "Chờ duyệt";
            case DADUYET:
                return "Đã duyệt";
            case DANGMUON:
                return "Đang mượn";
            case TUCHOI:
                return "Từ chối";
            case DATRA:
                return "Đã trả";
            default:
                return "Không xác định";
        }
    }

    public TheoDoiMuonSachDTO save(TheoDoiMuonSachDTO theoDoiMuonSachDTO) {
        // 1. Kiểm tra trạng thái mượn trước khi lưu (bao gồm cả số sách còn lại)
        String checkResult = checkBorrowStatus(theoDoiMuonSachDTO.getMaDocGia(), theoDoiMuonSachDTO.getMaSach());
        if (checkResult != null) {
            throw new RuntimeException(checkResult);
        }
        
        // 2. Xử lý Mã Độc Giả (MaDocGia / Email)
        String docGiaIdentifier = theoDoiMuonSachDTO.getMaDocGia();
        DocGia docGia;

        if (docGiaIdentifier != null && docGiaIdentifier.startsWith("DG")) {
            // SỬA: Sửa lỗi orElseThrow - findByMaDocGia trả về Optional
            docGia = docGiaRepository.findByMaDocGia(docGiaIdentifier)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Độc Giả"));
        } else {
            // SỬA: findByEmail trả về DocGia, không phải Optional
            docGia = docGiaRepository.findByEmail(docGiaIdentifier);
            if (docGia == null) {
                throw new RuntimeException("Không tìm thấy Độc Giả");
            }
        }

        String maDocGiaThucTe = docGia.getMaDocGia();
        
        // 3. Kiểm tra sách
        Sach sach = sachRepository.findById(theoDoiMuonSachDTO.getMaSach())
            .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));

        // 4. Xử lý nhân viên
        NhanVien nhanVien = null; 
        if (theoDoiMuonSachDTO.getMaNhanVien() != null && !theoDoiMuonSachDTO.getMaNhanVien().isEmpty()) {
            nhanVien = nhanVienRepository.findById(theoDoiMuonSachDTO.getMaNhanVien())
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));
        }

        // 5. Xử lý ngày mượn
        LocalDate ngayMuon = theoDoiMuonSachDTO.getNgayMuon();
        if (ngayMuon == null) {
            ngayMuon = LocalDate.now();
        }
        LocalDate ngayTraDuKien = ngayMuon.plus(14, ChronoUnit.DAYS);
        
        // 6. Tạo ID và kiểm tra trùng lặp
        TheoDoiMuonSachId id = new TheoDoiMuonSachId(
            maDocGiaThucTe, 
            theoDoiMuonSachDTO.getMaSach(), 
            ngayMuon
        );
        
        if (theoDoiMuonSachRepository.findById(id).isPresent()) {
            throw new RuntimeException("Phiếu mượn đã tồn tại");
        }

        // 7. Tạo entity và lưu
        TheoDoiMuonSach theoDoiMuonSach = new TheoDoiMuonSach();
        theoDoiMuonSach.setId(id);
        theoDoiMuonSach.setDocGia(docGia);
        theoDoiMuonSach.setSach(sach);
        theoDoiMuonSach.setNhanVien(nhanVien);
        theoDoiMuonSach.setNgayTra(ngayTraDuKien); 
        
        String trangThaiString = theoDoiMuonSachDTO.getTrangThaiMuon();
        if (trangThaiString == null) {
            trangThaiString = "CHODUYET";
        }
        theoDoiMuonSach.setTrangThaiMuon(TheoDoiMuonSach.TrangThaiMuon.valueOf(trangThaiString));

        TheoDoiMuonSach saved = theoDoiMuonSachRepository.save(theoDoiMuonSach);
        return toDTO(saved);
    }

    public TheoDoiMuonSachDTO update(TheoDoiMuonSachDTO theoDoiMuonSachDTO) {
        // 1. Tìm entity cần update
        TheoDoiMuonSachId id = new TheoDoiMuonSachId(
            theoDoiMuonSachDTO.getMaDocGia(), 
            theoDoiMuonSachDTO.getMaSach(), 
            theoDoiMuonSachDTO.getNgayMuon()
        );
        
        TheoDoiMuonSach existing = theoDoiMuonSachRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu mượn"));

        // 2. Update các field cần thiết
        if (theoDoiMuonSachDTO.getNgayTra() != null) {
            existing.setNgayTra(theoDoiMuonSachDTO.getNgayTra());
        }
        
        if (theoDoiMuonSachDTO.getTrangThaiMuon() != null) {
            existing.setTrangThaiMuon(TheoDoiMuonSach.TrangThaiMuon.valueOf(theoDoiMuonSachDTO.getTrangThaiMuon()));
        }

        // 3. Update nhân viên nếu có
        if (theoDoiMuonSachDTO.getMaNhanVien() != null && !theoDoiMuonSachDTO.getMaNhanVien().isEmpty()) {
            NhanVien nhanVien = nhanVienRepository.findById(theoDoiMuonSachDTO.getMaNhanVien())
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại"));
            existing.setNhanVien(nhanVien);
        }

        TheoDoiMuonSach updated = theoDoiMuonSachRepository.save(existing);
        return toDTO(updated);
    }

    public void delete(TheoDoiMuonSachId id) {
        theoDoiMuonSachRepository.deleteById(id);
    }

    public Page<TheoDoiMuonSachDTO> getByMaDocGiaPaginated(String maDocGia, Pageable pageable) {
        Page<TheoDoiMuonSach> page = theoDoiMuonSachRepository.findByDocGia_MaDocGia(maDocGia, pageable);
        return page.map(this::toDTO);
    }

    private TheoDoiMuonSachDTO toDTO(TheoDoiMuonSach theoDoiMuonSach) {
        if (theoDoiMuonSach == null) return null;
        
        TheoDoiMuonSachDTO dto = new TheoDoiMuonSachDTO();
        dto.setMaDocGia(theoDoiMuonSach.getId().getMaDocGia());
        dto.setMaSach(theoDoiMuonSach.getId().getMaSach());
        dto.setNgayMuon(theoDoiMuonSach.getId().getNgayMuon());
        dto.setNgayTra(theoDoiMuonSach.getNgayTra());
        dto.setTrangThaiMuon(theoDoiMuonSach.getTrangThaiMuon().name());
        
        if (theoDoiMuonSach.getDocGia() != null) {
            dto.setDocGia(toDocGiaDTO(theoDoiMuonSach.getDocGia()));
        }
        
        if (theoDoiMuonSach.getSach() != null) {
            dto.setSach(toSachDTO(theoDoiMuonSach.getSach()));
        }
        
        if (theoDoiMuonSach.getNhanVien() != null) {
            dto.setMaNhanVien(theoDoiMuonSach.getNhanVien().getMaNhanVien());
            dto.setTenNhanVien(theoDoiMuonSach.getNhanVien().getHoTenNV());
        }
        
        return dto;
    }

    // SỬA: Fix toDocGiaDTO method với đầy đủ field mapping
    private DocGiaDTO toDocGiaDTO(DocGia docGia) {
        if (docGia == null) return null;
        
        DocGiaDTO dto = new DocGiaDTO();
        dto.setMaDocGia(docGia.getMaDocGia());
        dto.setHoLot(docGia.getHoLot()); // SỬA: Dùng getHoLot() thay vì getTenDocGia()
        dto.setTen(docGia.getTen()); // SỬA: Thêm method getTen()
        dto.setEmail(docGia.getEmail());
        dto.setDienThoai(docGia.getDienThoai());
        dto.setDiaChi(docGia.getDiaChi());
        dto.setNgaySinh(docGia.getNgaySinh());
        
        // SỬA: Convert enum sang String
        if (docGia.getGioiTinh() != null) {
            dto.setGioiTinh(docGia.getGioiTinh().name());
        }
        
        // SỬA: Thêm ngayDangKy nếu có field này trong DocGia - nếu không có thì bỏ dòng này
        // dto.setNgayDangKy(docGia.getNgayDangKy());
        
        return dto;
    }

    // SỬA: toSachDTO method với type conversion đúng
    private SachDTO toSachDTO(Sach sach) {
        if (sach == null) return null;
        
        SachDTO dto = new SachDTO();
        dto.setMaSach(sach.getMaSach());
        dto.setTenSach(sach.getTenSach());
        dto.setDonGia(sach.getDonGia());
        dto.setSoQuyen(sach.getSoQuyen());
        dto.setSoLuong(sach.getSoLuong());
        dto.setNamXuatBan(sach.getNamXuatBan());
        dto.setTacGia(sach.getTacGia());
        dto.setMoTa(sach.getMoTa());
        dto.setAnhBia(sach.getAnhBia());
        dto.setDiemDanhGia(sach.getDiemDanhGia());
        dto.setGiamGia(sach.getGiamGia());
        
        if (sach.getNhaXuatBan() != null) {
            dto.setNhaXuatBan(sach.getNhaXuatBan().getTenNhaXuatBan());
        }
        
        if (sach.getTheLoais() != null) {
            List<String> theLoaiNames = sach.getTheLoais().stream()
                .map(TheLoai::getTenTheLoai)
                .collect(Collectors.toList());
            dto.setTheLoais(theLoaiNames);
        }
        
        return dto;
    }
}