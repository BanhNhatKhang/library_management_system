package com.example.webapp.services;

import com.example.webapp.models.Sach;
import com.example.webapp.models.UuDai;
import com.example.webapp.models.DocGia;
import com.example.webapp.dto.SachDTO;
import com.example.webapp.dto.UuDaiDTO;
import com.example.webapp.repository.UuDaiRepository;
import com.example.webapp.repository.DocGiaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.Optional;
import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
public class UuDaiService {

    @Autowired
    private UuDaiRepository uuDaiRepository;

    @Autowired
    private DocGiaRepository docGiaRepository;

    @Autowired
    private SachService sachService;
    

    public List<UuDaiDTO> getAllUuDai() {
        return uuDaiRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<UuDaiDTO> getUuDaiByNgayBatDau(LocalDate ngayBatDau) {
        return uuDaiRepository.findByNgayBatDau(ngayBatDau).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<UuDaiDTO> getUuDaiByNgayKetThuc(LocalDate ngayKetThuc) {
        return uuDaiRepository.findByNgayKetThuc(ngayKetThuc).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<UuDaiDTO> getUuDaiById(String maUuDai) {
        return uuDaiRepository.findByMaUuDai(maUuDai).map(this::toDTO);
    }

    public List<SachDTO> getSachByUuDaiId(String maUuDai) {
        Optional<UuDai> uuDaiOpt = uuDaiRepository.findByMaUuDai(maUuDai);

        if (uuDaiOpt.isEmpty()) {
            return List.of(); 
        }

        UuDai uuDai = uuDaiOpt.get();

        Set<Sach> sachs = uuDai.getSachs(); 

        return sachs.stream()
                    .map(sachService::toDTO)
                    .collect(Collectors.toList());
    }

    public UuDaiDTO saveUuDai(UuDaiDTO uuDaiDTO) {
        // nếu client không cung cấp mã ưu đãi, tự sinh mã ở service
        if (uuDaiDTO.getMaUuDai() == null || uuDaiDTO.getMaUuDai().trim().isEmpty()) {
            uuDaiDTO.setMaUuDai(generateNextMaUD());
        }
        UuDai uuDai = toEntity(uuDaiDTO);
        return toDTO(uuDaiRepository.save(uuDai));
    }

    public UuDaiDTO updateUuDai(String maUuDai, UuDaiDTO uuDaiDTO) {
        if (!uuDaiRepository.existsByMaUuDai(maUuDai)) {
            throw new RuntimeException("Thông tin ưu đãi không hợp lệ hoặc không tồn tại");
        }
        UuDai uuDai = toEntity(uuDaiDTO);
        uuDai.setMaUuDai(maUuDai);
        return toDTO(uuDaiRepository.save(uuDai));
    }

    public void deleteUuDai(String maUuDai) {
        if (!uuDaiRepository.existsByMaUuDai(maUuDai)) {
            throw new RuntimeException("Ưu đãi không tồn tại");
        }
        uuDaiRepository.deleteById(maUuDai);
    }

        // sinh mã ưu đãi tiếp theo dạng UD001, UD002, ...
    public String generateNextMaUD() {
        List<UuDai> all = uuDaiRepository.findAll();
        int max = 0;
        for (UuDai u : all) {
            String ma = u.getMaUuDai();
            if (ma == null) continue;
            String up = ma.toUpperCase();
            if (!up.startsWith("UD")) continue;
            String digits = up.replaceAll("\\D+", "");
            if (digits.isEmpty()) continue;
            try {
                int n = Integer.parseInt(digits);
                if (n > max) max = n;
            } catch (NumberFormatException ignored) {
            }
        }
        int next = max + 1;
        return "UD" + String.format("%03d", next);
    }

    public List<UuDaiDTO> getActiveUuDaiNotLinkedToBooks() {
        LocalDate now = LocalDate.now();
        List<UuDai> activeUuDai = uuDaiRepository.findActiveUuDaiNotLinkedToBooks(now);
        
        return activeUuDai.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public String saveUuDaiForDocGia(String email, String maUuDai) {
        // SỬA: Tìm DocGia bằng email thay vì maDocGia
        DocGia docGia = docGiaRepository.findByEmail(email);
        if (docGia == null) {
            throw new RuntimeException("Không tìm thấy độc giả với email: " + email);
        }
        
        Optional<UuDai> uuDaiOpt = uuDaiRepository.findById(maUuDai);
        if (uuDaiOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy ưu đãi");
        }
        
        UuDai uuDai = uuDaiOpt.get();
        
        // Kiểm tra ưu đãi còn hiệu lực
        LocalDate now = LocalDate.now();
        if (uuDai.getNgayKetThuc().isBefore(now)) {
            throw new RuntimeException("Ưu đãi đã hết hạn");
        }
        
        // Kiểm tra đã lưu chưa
        if (docGia.hasUuDaiDaLuu(uuDai)) {
            throw new RuntimeException("Bạn đã lưu ưu đãi này rồi");
        }
        
        // Lưu ưu đãi
        docGia.addUuDaiDaLuu(uuDai);
        docGiaRepository.save(docGia);
        
        return "Lưu ưu đãi thành công";
    }

    public String unsaveUuDaiForDocGia(String email, String maUuDai) {
        // SỬA: Tìm DocGia bằng email thay vì maDocGia
        DocGia docGia = docGiaRepository.findByEmail(email);
        if (docGia == null) {
            throw new RuntimeException("Không tìm thấy độc giả với email: " + email);
        }
        
        Optional<UuDai> uuDaiOpt = uuDaiRepository.findById(maUuDai);
        if (uuDaiOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy ưu đãi");
        }
        
        UuDai uuDai = uuDaiOpt.get();
        
        // Xóa ưu đãi khỏi danh sách đã lưu
        docGia.removeUuDaiDaLuu(uuDai);
        docGiaRepository.save(docGia);
        
        return "Bỏ lưu ưu đãi thành công";
    }

    public List<UuDaiDTO> getSavedUuDaiByEmail(String email) {
        // SỬA: Tìm DocGia bằng email thay vì maDocGia
        DocGia docGia = docGiaRepository.findByEmail(email);
        if (docGia == null) {
            return List.of();
        }
        
        LocalDate now = LocalDate.now();
        
        return docGia.getUuDaisDaLuu().stream()
            .filter(uuDai -> uuDai.getNgayKetThuc().isAfter(now) || uuDai.getNgayKetThuc().equals(now))
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public UuDaiDTO toDTO(UuDai uuDai) {
        UuDaiDTO dto = new UuDaiDTO();
        dto.setMaUuDai(uuDai.getMaUuDai());
        dto.setTenUuDai(uuDai.getTenUuDai());
        dto.setMoTa(uuDai.getMoTa());
        dto.setPhanTramGiam(uuDai.getPhanTramGiam());
        dto.setNgayBatDau(uuDai.getNgayBatDau());
        dto.setNgayKetThuc(uuDai.getNgayKetThuc());
        return dto;
    }

    public UuDai toEntity(UuDaiDTO dto) {
        UuDai uuDai = new UuDai();
        uuDai.setMaUuDai(dto.getMaUuDai());
        uuDai.setTenUuDai(dto.getTenUuDai());
        uuDai.setMoTa(dto.getMoTa());
        uuDai.setPhanTramGiam(dto.getPhanTramGiam());
        uuDai.setNgayBatDau(dto.getNgayBatDau());
        uuDai.setNgayKetThuc(dto.getNgayKetThuc());
        return uuDai;
    }
}