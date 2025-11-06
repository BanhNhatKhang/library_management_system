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

    public List<GioHangResponseDTO> getGioHangsByMaDocGia(String maDocGiaIdentifier) {
    
        String maDocGiaThucTe = maDocGiaIdentifier;

    // KIỂM TRA: Nếu mã nhận được KHÔNG giống định dạng DGxxx , 
    // thì tìm Mã Độc Giả thực tế.
        if (!maDocGiaIdentifier.startsWith("DG")) {
            // Giả định DocGiaRepository có phương thức tìm bằng Email
            DocGia docGia = docGiaRepository.findByEmail(maDocGiaIdentifier); 
            if (docGia == null) {
                // Trường hợp không tìm thấy độc giả nào với Email này
                return List.of(); 
            }
            maDocGiaThucTe = docGia.getMaDocGia();
        }
        
        // Sử dụng Mã Độc Giả thực tế để truy vấn DB
        return gioHangRepository.findByDocGia_MaDocGia(maDocGiaThucTe)
            .stream()
            .map(GioHangResponseDTO::new) 
            .toList();
    }

    public GioHangDTO saveGioHang(GioHangDTO gioHangDTO) {
        GioHang gioHang = toEntity(gioHangDTO);
        GioHang saved = gioHangRepository.save(gioHang);
        return toDTO(saved);
    }

    public GioHangDTO addOrUpdateGioHang(GioHangDTO gioHangDTO) {
        GioHangId id = new GioHangId(gioHangDTO.getMaDocGia(), gioHangDTO.getMaSach());

        // 1. Kiểm tra xem mục giỏ hàng đã tồn tại chưa
        Optional<GioHang> existingGioHang = gioHangRepository.findById(id);

        GioHang gioHang;
        if (existingGioHang.isPresent()) {
            // 2. Nếu đã tồn tại: Cập nhật số lượng
            gioHang = existingGioHang.get();

            int newTotalQuantity = gioHang.getSoLuong() + gioHangDTO.getSoLuong();
            
            gioHang.setSoLuong(newTotalQuantity); 
            
        } else {
            // 3. Nếu chưa tồn tại: Tạo entity mới
            gioHang = toEntity(gioHangDTO);
        }

        // 4. Lưu lại
        GioHang saved = gioHangRepository.save(gioHang);
        return toDTO(saved);
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
        
        String docGiaIdentifier = gioHangDTO.getMaDocGia();

        DocGia docgia;
        if (docGiaIdentifier.startsWith("DG")) {
            // Nếu là Mã DG, tìm theo ID (vì maDocGia là primary key)
            docgia = docGiaRepository.findById(docGiaIdentifier)
                .orElse(null);
        } else {
            // Nếu là Email/Subject, tìm theo Email
            docgia = docGiaRepository.findByEmail(docGiaIdentifier);
        }
        
        if (docgia == null) {
            throw new RuntimeException("Độc giả không tồn tại");
        }

        // LẤY MÃ DG THỰC TẾ ĐỂ TẠO ID
        String maDocGiaThucTe = docgia.getMaDocGia();
        
        // TẠO GioHangId VỚI MÃ DG THỰC TẾ
        GioHangId id = new GioHangId(maDocGiaThucTe, gioHangDTO.getMaSach());
        gioHang.setId(id);
        gioHang.setSoLuong(gioHangDTO.getSoLuong());
        gioHang.setNgayThem(gioHangDTO.getNgayThem());
        gioHang.setDocGia(docgia); // Thiết lập mối quan hệ

        Sach sach = sachRepository.findById(gioHangDTO.getMaSach())
            .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));
        gioHang.setSach(sach);
        return gioHang;
    }
}