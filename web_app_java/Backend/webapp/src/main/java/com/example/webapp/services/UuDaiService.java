package com.example.webapp.services;

import com.example.webapp.models.Sach;
import com.example.webapp.models.UuDai;
import com.example.webapp.dto.SachDTO;
import com.example.webapp.dto.UuDaiDTO;
import com.example.webapp.repository.UuDaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.util.Set;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@Service
public class UuDaiService {

    @Autowired
    private UuDaiRepository uuDaiRepository;

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