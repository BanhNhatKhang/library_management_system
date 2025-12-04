package com.example.webapp.services;

import com.example.webapp.models.DocGia;
import com.example.webapp.repository.DocGiaRepository;
import com.example.webapp.dto.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@Service
public class DocGiaService {

    @Autowired
    private DocGiaRepository docGiaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DonHangService donHangService;

    public List<DocGiaDTO> getAllDocGia() {
        return docGiaRepository.findAll().stream().map(this::toDTO).toList();
    }

    
    public List<DonHangDTO> getDonHangByEmail(String email) {
        DocGia docGia = docGiaRepository.findByEmail(email);
        if (docGia == null) {
            throw new RuntimeException("Không tìm thấy độc giả");
        }
        
        return donHangService.getDonHangByMaDocGia(docGia.getMaDocGia());
    }

    public Page<DonHangDTO> getDonHangByEmailPaginated(String email, Pageable pageable) {
        DocGia docGia = docGiaRepository.findByEmail(email);
        if (docGia == null) {
            throw new RuntimeException("Không tìm thấy độc giả");
        }
        
        return donHangService.getDonHangByMaDocGiaPaginated(docGia.getMaDocGia(), pageable);
    }

    public Optional<DocGiaDTO> getDocGiaById(String maDocGia) {
        return docGiaRepository.findById(maDocGia).map(this::toDTO);
    }

    public DocGiaDTO getDocGiaByPrincipal(Principal principal) {
        String username = principal.getName(); 
        
        // Tìm kiếm theo email hoặc điện thoại
        DocGia docGia = docGiaRepository.findByEmail(username);
        if (docGia == null) {
            docGia = docGiaRepository.findByDienThoai(username);
        }
        
        if (docGia == null) {
            throw new RuntimeException("Không tìm thấy thông tin độc giả");
        }
        
        return toDTO(docGia);
    }

    public DocGiaDTO updateDocGiaByPrincipal(Principal principal, DocGiaDTO docGiaDTO) {
        String username = principal.getName();
        
        // Tìm DocGia hiện tại
        DocGia existingDocGia = docGiaRepository.findByEmail(username);
        if (existingDocGia == null) {
            existingDocGia = docGiaRepository.findByDienThoai(username);
        }
        
        if (existingDocGia == null) {
            throw new RuntimeException("Không tìm thấy thông tin độc giả");
        }
        
        // Cập nhật thông tin
        existingDocGia.setHoLot(docGiaDTO.getHoLot());
        existingDocGia.setTen(docGiaDTO.getTen());
        existingDocGia.setEmail(docGiaDTO.getEmail());
        existingDocGia.setDienThoai(docGiaDTO.getDienThoai());
        existingDocGia.setDiaChi(docGiaDTO.getDiaChi());
        
        // SỬA: Convert String to enum
        if (docGiaDTO.getGioiTinh() != null) {
            existingDocGia.setGioiTinh(DocGia.GioiTinh.valueOf(docGiaDTO.getGioiTinh()));
        }
        
        existingDocGia.setNgaySinh(docGiaDTO.getNgaySinh());
        
        DocGia savedDocGia = docGiaRepository.save(existingDocGia);
        return toDTO(savedDocGia);
    }

    public DocGia saveDocGia(DocGia docGia) {
        return docGiaRepository.save(docGia);
    }

        public String changePassword(Principal principal, DoiMatKhauRequestDTO request) {
        String username = principal.getName();
        
        // Tìm DocGia hiện tại
        DocGia existingDocGia = docGiaRepository.findByEmail(username);
        if (existingDocGia == null) {
            existingDocGia = docGiaRepository.findByDienThoai(username);
        }
        
        if (existingDocGia == null) {
            throw new RuntimeException("Không tìm thấy thông tin độc giả");
        }
        
        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getMatKhauHienTai(), existingDocGia.getMatKhau())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        
        // Kiểm tra mật khẩu mới và nhập lại
        if (!request.getMatKhauMoi().equals(request.getNhapLaiMatKhauMoi())) {
            throw new RuntimeException("Mật khẩu mới và nhập lại mật khẩu không khớp");
        }
        
        // Cập nhật mật khẩu mới
        existingDocGia.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        docGiaRepository.save(existingDocGia);
        
        return "Đổi mật khẩu thành công";
    }

    public DocGia updateDocGia(String maDocGia, DocGia docGia) {
        DocGia existing = docGiaRepository.findById(maDocGia)
            .orElseThrow(() -> new RuntimeException("Độc giả không tồn tại"));
        if (!existing.getEmail().equals(docGia.getEmail()) &&
            docGiaRepository.existsByEmail(docGia.getEmail())) {
                throw new RuntimeException("Email đã được sử dụng bởi độc giả khác");
        }

        if (docGiaRepository.existsByDienThoai(docGia.getDienThoai()) &&
            !existing.getDienThoai().equals(docGia.getDienThoai())) {
                throw new RuntimeException("Điện thoại đã được sử dụng");
        }
        
        existing.setHoLot(docGia.getHoLot());
        existing.setTen(docGia.getTen());
        existing.setDienThoai(docGia.getDienThoai());
        existing.setEmail(docGia.getEmail());
        existing.setGioiTinh(docGia.getGioiTinh());
        existing.setDiaChi(docGia.getDiaChi());
        existing.setNgaySinh(docGia.getNgaySinh());
        existing.setTrangThai(docGia.getTrangThai());

        if (docGia.getMatKhau() != null && !docGia.getMatKhau().isEmpty()) {
            existing.setMatKhau(passwordEncoder.encode(docGia.getMatKhau()));
        }

        return docGiaRepository.save(existing);
    }

    public void deleteDocGia(String maDocGia) {
        docGiaRepository.deleteById(maDocGia);
    }

    public String generateMaDocGia() {
        String lastMaDocGia = docGiaRepository.findMaxMaDocGia();
        int nextNumber = 1;
        if (lastMaDocGia != null) {
            nextNumber = Integer.parseInt(lastMaDocGia.substring(2)) + 1; // Giả sử mã độc giả có định dạng "DG001"
        }
        return String.format("DG%03d", nextNumber); // Tạo mã độc giả mới với định dạng "DG001"
    }

    public DocGia registerDocGia(DocGiaDangKyDTO docGiaDangKyDTO) {
        if (docGiaRepository.existsByEmail(docGiaDangKyDTO.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng");
        }
        if (docGiaRepository.existsByDienThoai(docGiaDangKyDTO.getDienThoai())) {
            throw new RuntimeException("Số điện thoại này đã được sử dụng");
        }
        DocGia docGia = new DocGia();
        docGia.setMaDocGia(generateMaDocGia());
        docGia.setHoLot(docGiaDangKyDTO.getHoLot());
        docGia.setTen(docGiaDangKyDTO.getTen());
        docGia.setGioiTinh(DocGia.GioiTinh.valueOf(docGiaDangKyDTO.getGioiTinh()));
        docGia.setDiaChi(docGiaDangKyDTO.getDiaChi());
        docGia.setNgaySinh(docGiaDangKyDTO.getNgaySinh());
        docGia.setDienThoai(docGiaDangKyDTO.getDienThoai());
        docGia.setEmail(docGiaDangKyDTO.getEmail());
        docGia.setMatKhau(passwordEncoder.encode(docGiaDangKyDTO.getMatKhau()));
        return docGiaRepository.save(docGia);
    }

    public DocGia loginDocGia(String emailOrDienThoai, String matKhau) {
        DocGia docGia = docGiaRepository.findByEmail(emailOrDienThoai);
        if (docGia == null) {
            docGia = docGiaRepository.findByDienThoai(emailOrDienThoai);
        }
        if (docGia == null || !passwordEncoder.matches(matKhau, docGia.getMatKhau())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không đúng");
        }
        return docGia;

    }

    public DocGiaDTO toDTO(DocGia docGia) {
        DocGiaDTO docGiaDTO = new DocGiaDTO();
        docGiaDTO.setMaDocGia(docGia.getMaDocGia());
        docGiaDTO.setHoLot(docGia.getHoLot());
        docGiaDTO.setTen(docGia.getTen());
        
        // SỬA: Convert enum to String
        if (docGia.getGioiTinh() != null) {
            docGiaDTO.setGioiTinh(docGia.getGioiTinh().name());
        }
        
        docGiaDTO.setDiaChi(docGia.getDiaChi());
        docGiaDTO.setNgaySinh(docGia.getNgaySinh());
        docGiaDTO.setDienThoai(docGia.getDienThoai());
        docGiaDTO.setEmail(docGia.getEmail());
        
        // Thêm vaiTro và trangThai nếu cần
        if (docGia.getVaiTro() != null) {
            docGiaDTO.setVaiTro(docGia.getVaiTro().name());
        }
        if (docGia.getTrangThai() != null) {
            docGiaDTO.setTrangThai(docGia.getTrangThai().name());
        }
        
        return docGiaDTO;
    }

    public DocGia toEntity(DocGiaDTO docGiaDTO) {
        DocGia docGia = new DocGia();
        docGia.setMaDocGia(docGiaDTO.getMaDocGia());
        docGia.setHoLot(docGiaDTO.getHoLot());
        docGia.setTen(docGiaDTO.getTen());
        
        // SỬA: Convert String to enum safely
        if (docGiaDTO.getGioiTinh() != null) {
            try {
                docGia.setGioiTinh(DocGia.GioiTinh.valueOf(docGiaDTO.getGioiTinh()));
            } catch (IllegalArgumentException e) {
                // Handle invalid enum value
                docGia.setGioiTinh(DocGia.GioiTinh.NAM); // Default value
            }
        }
        
        docGia.setDiaChi(docGiaDTO.getDiaChi());
        docGia.setNgaySinh(docGiaDTO.getNgaySinh());
        docGia.setDienThoai(docGiaDTO.getDienThoai());
        docGia.setEmail(docGiaDTO.getEmail());
        
        return docGia;
    }

}