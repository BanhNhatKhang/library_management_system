package com.example.webapp.services;

import com.example.webapp.models.Sach;
import com.example.webapp.models.UuDai;
import com.example.webapp.models.DocGia;
import com.example.webapp.dto.SachDTO;
import com.example.webapp.dto.UuDaiDTO;
import com.example.webapp.repository.UuDaiRepository;
import com.example.webapp.repository.DocGiaRepository;
import com.example.webapp.repository.SachRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
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
    private SachRepository sachRepository;

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

    public UuDaiDTO saveUuDai(UuDaiDTO uuDaiDTO, List<String> maSachList) {
        if (uuDaiDTO.getMaUuDai() == null || uuDaiDTO.getMaUuDai().trim().isEmpty()) {
            uuDaiDTO.setMaUuDai(generateNextMaUD());
        }
        UuDai uuDai = toEntity(uuDaiDTO);

        // Liên kết sách với ưu đãi
        Set<Sach> sachSet = new HashSet<>();
        if (maSachList != null) {
            for (String maSach : maSachList) {
                Optional<Sach> sachOpt = sachRepository.findById(maSach);
                if (sachOpt.isPresent()) {
                    Sach sach = sachOpt.get();
                    sach.getUuDais().add(uuDai);
                    // Cập nhật giảm giá cho sách
                    sach.setGiamGia(uuDai.getPhanTramGiam().doubleValue() / 100.0);
                    sachRepository.save(sach);
                    sachSet.add(sach);
                }
            }
        }
        uuDai.setSachs(sachSet);

        return toDTO(uuDaiRepository.save(uuDai));
    }

    @Transactional
    public UuDaiDTO updateUuDai(String maUuDai, UuDaiDTO uuDaiDTO, List<String> maSachList) {
        if (!uuDaiRepository.existsByMaUuDai(maUuDai)) {
            throw new RuntimeException("Thông tin ưu đãi không hợp lệ hoặc không tồn tại");
        }
        UuDai uuDai = toEntity(uuDaiDTO);
        uuDai.setMaUuDai(maUuDai);

        // Lấy ưu đãi cũ để xử lý sách cũ
        Optional<UuDai> oldUuDaiOpt = uuDaiRepository.findByMaUuDai(maUuDai);
        Set<Sach> oldSachSet = oldUuDaiOpt.map(UuDai::getSachs).orElse(new HashSet<>());

        // Sách mới được chọn
        Set<Sach> newSachSet = new HashSet<>();
        if (maSachList != null) {
            for (String maSach : maSachList) {
                Optional<Sach> sachOpt = sachRepository.findById(maSach);
                if (sachOpt.isPresent()) {
                    Sach sach = sachOpt.get();
                    sach.getUuDais().add(uuDai);
                    sach.setGiamGia(uuDai.getPhanTramGiam().doubleValue() / 100.0);
                    sachRepository.save(sach);
                    newSachSet.add(sach);
                }
            }
        }
        uuDai.setSachs(newSachSet);

        // Xóa giảm giá khỏi các sách không còn thuộc ưu đãi này
        for (Sach sach : oldSachSet) {
            if (!newSachSet.contains(sach)) {
                sach.getUuDais().remove(uuDai);
                sach.setGiamGia(null);
                sachRepository.save(sach);
            }
        }

        return toDTO(uuDaiRepository.save(uuDai));
    }

    @Transactional
    public void deleteUuDai(String maUuDai) {
        if (!uuDaiRepository.existsByMaUuDai(maUuDai)) {
            throw new RuntimeException("Ưu đãi không tồn tại");
        }
        
        try {
            // SỬA: Thêm logic kiểm tra ràng buộc trước khi xóa
            Optional<UuDai> uuDaiOpt = uuDaiRepository.findByMaUuDai(maUuDai);
            if (uuDaiOpt.isPresent()) {
                UuDai uuDai = uuDaiOpt.get();
                
                // Kiểm tra xem ưu đãi có đang được sử dụng trong đơn hàng không
                if (!uuDai.getDonHangs().isEmpty()) {
                    throw new RuntimeException("Không thể xóa ưu đãi này vì đang được sử dụng trong " + 
                                             uuDai.getDonHangs().size() + " đơn hàng. " +
                                             "Bạn có thể chỉnh sửa ngày kết thúc để vô hiệu hóa ưu đãi.");
                }
                
                // Kiểm tra xem ưu đãi có đang được áp dụng cho sách không
                if (!uuDai.getSachs().isEmpty()) {
                    // Xóa liên kết với sách trước
                    uuDai.getSachs().clear();
                    uuDaiRepository.save(uuDai);
                }
            }
            
            // Thực hiện xóa
            uuDaiRepository.deleteById(maUuDai);
            
        } catch (DataIntegrityViolationException e) {
            String errorMessage = e.getMessage();
            
            if (errorMessage.contains("donhang_uudai")) {
                throw new RuntimeException("Không thể xóa ưu đãi này vì đã được sử dụng trong đơn hàng. " +
                                         "Bạn có thể chỉnh sửa ngày kết thúc để vô hiệu hóa ưu đãi thay vì xóa.");
            } else if (errorMessage.contains("sach_uudai")) {
                throw new RuntimeException("Không thể xóa ưu đãi này vì đang được áp dụng cho sách. " +
                                         "Vui lòng bỏ liên kết với sách trước khi xóa.");
            } else {
                throw new RuntimeException("Không thể xóa ưu đãi này do có ràng buộc dữ liệu. " +
                                         "Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi không xác định khi xóa ưu đãi: " + e.getMessage());
        }
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

    // THÊM: Method để vô hiệu hóa ưu đãi thay vì xóa
    @Transactional
    public UuDaiDTO deactivateUuDai(String maUuDai) {
        Optional<UuDai> uuDaiOpt = uuDaiRepository.findByMaUuDai(maUuDai);
        if (uuDaiOpt.isEmpty()) {
            throw new RuntimeException("Ưu đãi không tồn tại");
        }
        
        UuDai uuDai = uuDaiOpt.get();
        
        // Set ngày kết thúc = hôm qua để vô hiệu hóa
        LocalDate yesterday = LocalDate.now().minusDays(1);
        uuDai.setNgayKetThuc(yesterday);
        
        UuDai saved = uuDaiRepository.save(uuDai);
        return toDTO(saved);
    }

    // THÊM: Method kiểm tra ưu đãi có thể xóa không
    public boolean canDeleteUuDai(String maUuDai) {
        Optional<UuDai> uuDaiOpt = uuDaiRepository.findByMaUuDai(maUuDai);
        if (uuDaiOpt.isEmpty()) {
            return false;
        }
        
        UuDai uuDai = uuDaiOpt.get();
        return uuDai.getDonHangs().isEmpty() && uuDai.getSachs().isEmpty();
    }
}