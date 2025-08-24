package com.example.webapp.services;

import com.example.webapp.models.TheLoai;
import com.example.webapp.dto.TheLoaiDTO;
import com.example.webapp.repository.TheLoaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TheLoaiService {

    @Autowired
    private TheLoaiRepository theLoaiRepository;

    public List<TheLoaiDTO> getAllTheLoai() {
        return theLoaiRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Optional<TheLoaiDTO> getTheLoaiById(String maTheLoai) {
        return Optional.ofNullable(theLoaiRepository.findByMaTheLoai(maTheLoai)).map(this::toDTO);
    }

    public TheLoaiDTO saveTheLoai(TheLoaiDTO theLoaiDTO) {
        TheLoai theLoai = toEntity(theLoaiDTO);
        return toDTO(theLoaiRepository.save(theLoai));
    }

    public TheLoaiDTO updateTheLoai(String maTheLoai, TheLoaiDTO theLoaiDTO) {
        if (!theLoaiRepository.existsByMaTheLoai(maTheLoai)) {
            throw new RuntimeException("Thể loại không tồn tại");
        }
        TheLoai theLoai = toEntity(theLoaiDTO);
        theLoai.setMaTheLoai(maTheLoai);
        return toDTO(theLoaiRepository.save(theLoai));
    }

    public void deleteTheLoai(String maTheLoai) {
        if (!theLoaiRepository.existsByMaTheLoai(maTheLoai)) {
            throw new RuntimeException("Thể loại không tồn tại");
        }
        theLoaiRepository.deleteById(maTheLoai);
    }

    public TheLoaiDTO toDTO(TheLoai theLoai) {
        TheLoaiDTO dto = new TheLoaiDTO();
        dto.setMaTheLoai(theLoai.getMaTheLoai());
        dto.setTenTheLoai(theLoai.getTenTheLoai());
        return dto;
    }

    public TheLoai toEntity(TheLoaiDTO dto) {
        TheLoai theLoai = new TheLoai();
        theLoai.setMaTheLoai(dto.getMaTheLoai());
        theLoai.setTenTheLoai(dto.getTenTheLoai());
        return theLoai;
    }
}