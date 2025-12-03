package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.dto.*;
import com.example.webapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@Service
public class GioHangService {
    
    private static final Logger logger = LoggerFactory.getLogger(GioHangService.class);

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

    // Method để thêm hoặc cập nhật giỏ hàng
    public GioHangResponseDTO addOrUpdateGioHang(GioHangDTO gioHangDTO) {
        try {
            // Tìm mã độc giả thực tế
            String maDocGiaThucTe = gioHangDTO.getMaDocGia();
            if (!gioHangDTO.getMaDocGia().startsWith("DG")) {
                DocGia docGia = docGiaRepository.findByEmail(gioHangDTO.getMaDocGia());
                if (docGia == null) {
                    throw new RuntimeException("Không tìm thấy độc giả");
                }
                maDocGiaThucTe = docGia.getMaDocGia();
            }

            // Tạo ID composite
            GioHangId id = new GioHangId(maDocGiaThucTe, gioHangDTO.getMaSach());
            
            // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
            Optional<GioHang> existingGioHang = gioHangRepository.findById(id);
            
            if (existingGioHang.isPresent()) {
                // Cập nhật số lượng nếu đã tồn tại
                GioHang gioHang = existingGioHang.get();
                gioHang.setSoLuong(gioHang.getSoLuong() + gioHangDTO.getSoLuong());
                GioHang savedGioHang = gioHangRepository.save(gioHang);
                return new GioHangResponseDTO(savedGioHang);
            } else {
                // Tạo mới nếu chưa tồn tại
                return addGioHang(gioHangDTO);
            }

        } catch (Exception e) {
            System.err.println("Error adding or updating cart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi thêm/cập nhật giỏ hàng: " + e.getMessage());
        }
    }

    public void deleteGioHang(GioHangId id) {
        gioHangRepository.deleteById(id);
    }

    // Thêm method mới để xóa theo email/identifier
    public void deleteGioHangByIdentifier(String docGiaIdentifier, String maSach) {
        logger.info("Attempting to delete item: docGiaIdentifier={}, maSach={}", docGiaIdentifier, maSach);
        
        // Tìm mã độc giả thực tế
        String maDocGiaThucTe = docGiaIdentifier;

        if (!docGiaIdentifier.startsWith("DG")) {
            DocGia docGia = docGiaRepository.findByEmail(docGiaIdentifier);
            if (docGia == null) {
                logger.error("DocGia not found for identifier: {}", docGiaIdentifier);
                throw new RuntimeException("Không tìm thấy độc giả");
            }
            maDocGiaThucTe = docGia.getMaDocGia();
            logger.info("Resolved maDocGia: {}", maDocGiaThucTe);
        }

        // Tạo ID với mã độc giả thực tế
        GioHangId id = new GioHangId(maDocGiaThucTe, maSach);
        
        // Xóa sản phẩm
        if (gioHangRepository.existsById(id)) {
            gioHangRepository.deleteById(id);
            logger.info("Successfully deleted cart item: {}", id);
        } else {
            logger.error("Cart item not found: {}", id);
            throw new RuntimeException("Không tìm thấy sản phẩm trong giỏ hàng");
        }
    }

    public void deleteAllGioHangByDocGia(String maDocGia) {
        gioHangRepository.deleteByDocGia_MaDocGia(maDocGia);
    }

    // Thêm method mới để xóa tất cả theo email/identifier
    public void deleteAllGioHangByIdentifier(String docGiaIdentifier) {
        String maDocGiaThucTe = docGiaIdentifier;

        if (!docGiaIdentifier.startsWith("DG")) {
            DocGia docGia = docGiaRepository.findByEmail(docGiaIdentifier);
            if (docGia == null) {
                throw new RuntimeException("Không tìm thấy độc giả");
            }
            maDocGiaThucTe = docGia.getMaDocGia();
        }

        gioHangRepository.deleteByDocGia_MaDocGia(maDocGiaThucTe);
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

    public GioHangResponseDTO updateGioHang(GioHangDTO gioHangDTO) {
        try {
            // Log để debug
            System.out.println("Updating cart: " + gioHangDTO.getMaDocGia() + ", " + gioHangDTO.getMaSach() + ", quantity: " + gioHangDTO.getSoLuong());
            
            // Tìm mã độc giả thực tế
            String maDocGiaThucTe = gioHangDTO.getMaDocGia();
            if (!gioHangDTO.getMaDocGia().startsWith("DG")) {
                DocGia docGia = docGiaRepository.findByEmail(gioHangDTO.getMaDocGia());
                if (docGia == null) {
                    throw new RuntimeException("Không tìm thấy độc giả");
                }
                maDocGiaThucTe = docGia.getMaDocGia();
            }

            // Tạo ID composite
            GioHangId id = new GioHangId(maDocGiaThucTe, gioHangDTO.getMaSach());
            
            // Kiểm tra sản phẩm có tồn tại trong giỏ hàng không
            Optional<GioHang> existingGioHang = gioHangRepository.findById(id);
            if (!existingGioHang.isPresent()) {
                throw new RuntimeException("Sản phẩm không tồn tại trong giỏ hàng");
            }

            // Validate số lượng
            if (gioHangDTO.getSoLuong() <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0");
            }

            // Lấy thông tin sách để kiểm tra tồn kho
            Sach sach = sachRepository.findById(gioHangDTO.getMaSach()).orElse(null);
            if (sach == null) {
                throw new RuntimeException("Không tìm thấy sách");
            }

            // Kiểm tra tồn kho
            if (gioHangDTO.getSoLuong() > sach.getSoLuong()) {
                throw new RuntimeException("Số lượng yêu cầu vượt quá tồn kho (" + sach.getSoLuong() + ")");
            }

            // Cập nhật số lượng
            GioHang gioHang = existingGioHang.get();
            gioHang.setSoLuong(gioHangDTO.getSoLuong());
            
            // Lưu thay đổi
            GioHang savedGioHang = gioHangRepository.save(gioHang);
            
            // Trả về response - sử dụng constructor có sẵn
            return new GioHangResponseDTO(savedGioHang);

        } catch (Exception e) {
            System.err.println("Error updating cart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi cập nhật giỏ hàng: " + e.getMessage());
        }
    }

    public GioHangResponseDTO addGioHang(GioHangDTO gioHangDTO) {
        try {
            // Validation
            if (gioHangDTO.getSoLuong() <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0");
            }

            // Tìm mã độc giả thực tế
            String maDocGiaThucTe = gioHangDTO.getMaDocGia();
            if (!gioHangDTO.getMaDocGia().startsWith("DG")) {
                DocGia docGia = docGiaRepository.findByEmail(gioHangDTO.getMaDocGia());
                if (docGia == null) {
                    throw new RuntimeException("Không tìm thấy độc giả");
                }
                maDocGiaThucTe = docGia.getMaDocGia();
            }

            // Kiểm tra sách tồn tại
            Sach sach = sachRepository.findById(gioHangDTO.getMaSach()).orElse(null);
            if (sach == null) {
                throw new RuntimeException("Không tìm thấy sách");
            }

            // Kiểm tra tồn kho
            if (gioHangDTO.getSoLuong() > sach.getSoLuong()) {
                throw new RuntimeException("Số lượng yêu cầu vượt quá tồn kho (" + sach.getSoLuong() + ")");
            }

            // Tìm DocGia entity
            DocGia docGia = docGiaRepository.findById(maDocGiaThucTe).orElse(null);
            if (docGia == null) {
                throw new RuntimeException("Không tìm thấy thông tin độc giả");
            }

            // Tạo GioHang entity
            GioHang gioHang = new GioHang();
            GioHangId id = new GioHangId(maDocGiaThucTe, gioHangDTO.getMaSach());
            gioHang.setId(id);
            gioHang.setDocGia(docGia);
            gioHang.setSach(sach);
            gioHang.setSoLuong(gioHangDTO.getSoLuong());
            gioHang.setNgayThem(LocalDate.now());

            GioHang savedGioHang = gioHangRepository.save(gioHang);
            return new GioHangResponseDTO(savedGioHang);

        } catch (Exception e) {
            System.err.println("Error adding to cart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi thêm vào giỏ hàng: " + e.getMessage());
        }
    }
}