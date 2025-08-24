package com.example.webapp.services;

import com.example.webapp.models.UuDai;
import com.example.webapp.dto.UuDaiDTO;
import com.example.webapp.repository.UuDaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@Service
public class UuDaiService {

    @Autowired
    private UuDaiRepository uuDaiRepository;

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

    public UuDaiDTO saveUuDai(UuDaiDTO uuDaiDTO) {
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