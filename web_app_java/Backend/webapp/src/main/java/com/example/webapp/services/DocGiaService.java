package com.example.webapp.services;

import com.example.webapp.models.DocGia;
import com.example.webapp.dto.DocGiaDTO;
import com.example.webapp.repository.DocGiaRepository;
import com.example.webapp.dto.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocGiaService {

    @Autowired
    private DocGiaRepository docGiaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<DocGiaDTO> getAllDocGia() {
        return docGiaRepository.findAll().stream().map(this::toDTO).toList();
    }

    public Optional<DocGiaDTO> getDocGiaById(String maDocGia) {
        return docGiaRepository.findById(maDocGia).map(this::toDTO);
    }

    public DocGia saveDocGia(DocGia docGia) {
        return docGiaRepository.save(docGia);
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
        docGiaDTO.setGioiTinh(docGia.getGioiTinh());
        docGiaDTO.setDiaChi(docGia.getDiaChi());
        docGiaDTO.setNgaySinh(docGia.getNgaySinh());
        docGiaDTO.setDienThoai(docGia.getDienThoai());
        docGiaDTO.setEmail(docGia.getEmail());
        return docGiaDTO;
    }

    public DocGia toEntity(DocGiaDTO docGiaDTO) {
        DocGia docGia = new DocGia();
        docGia.setMaDocGia(docGiaDTO.getMaDocGia());
        docGia.setHoLot(docGiaDTO.getHoLot());
        docGia.setTen(docGiaDTO.getTen());
        docGia.setGioiTinh(docGiaDTO.getGioiTinh());
        docGia.setDiaChi(docGiaDTO.getDiaChi());
        docGia.setNgaySinh(docGiaDTO.getNgaySinh());
        docGia.setDienThoai(docGiaDTO.getDienThoai());
        docGia.setEmail(docGiaDTO.getEmail());
        return docGia;
    }

}