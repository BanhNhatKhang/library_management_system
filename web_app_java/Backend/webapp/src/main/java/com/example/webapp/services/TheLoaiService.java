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

    // keep existing save for compatibility, delegate to new method with null prefix
    public TheLoaiDTO saveTheLoai(TheLoaiDTO theLoaiDTO) {
        return saveTheLoai(theLoaiDTO, null);
    }

    // new save method: if maTheLoai missing, generate based on provided prefix (TL | FB)
    public TheLoaiDTO saveTheLoai(TheLoaiDTO theLoaiDTO, String prefix) {
        if (theLoaiDTO.getMaTheLoai() == null || theLoaiDTO.getMaTheLoai().trim().isEmpty()) {
            String p = (prefix == null || prefix.trim().isEmpty()) ? "TL" : prefix.trim().toUpperCase();
            theLoaiDTO.setMaTheLoai(generateNextMaTheLoai(p));
        }
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

    // generate next code like TL006 or FB005 by scanning existing codes
    public String generateNextMaTheLoai(String prefix) {
        if (prefix == null || prefix.trim().isEmpty()) {
            prefix = "TL";
        }
        prefix = prefix.trim().toUpperCase();

        List<TheLoai> all = theLoaiRepository.findAll();
        int max = 0;
        for (TheLoai t : all) {
            String ma = t.getMaTheLoai();
            if (ma == null) continue;
            String up = ma.toUpperCase();
            if (!up.startsWith(prefix)) continue;
            String digits = up.replaceAll("\\D+", "");
            if (digits.isEmpty()) continue;
            try {
                int n = Integer.parseInt(digits);
                if (n > max) max = n;
            } catch (NumberFormatException ignored) {
            }
        }
        int next = max + 1;
        return prefix + String.format("%03d", next);
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