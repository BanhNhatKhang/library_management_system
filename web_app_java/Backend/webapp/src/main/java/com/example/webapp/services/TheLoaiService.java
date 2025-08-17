package com.example.webapp.services;

import com.example.webapp.models.TheLoai;
import com.example.webapp.repository.TheLoaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TheLoaiService {

    @Autowired
    private TheLoaiRepository theLoaiRepository;

    public List<TheLoai> getAllTheLoai() {
        return theLoaiRepository.findAll();
    }

    public Optional<TheLoai> getTheLoaiById(String maTheLoai) {
        return Optional.ofNullable(theLoaiRepository.findByMaTheLoai(maTheLoai));
    }

    public TheLoai saveTheLoai(TheLoai theLoai) {
        return theLoaiRepository.save(theLoai);
    }

    public TheLoai updateTheLoai(String maTheLoai, TheLoai theLoai) {
        if (!theLoaiRepository.existsByMaTheLoai(maTheLoai)) {
            throw new RuntimeException("Thể loại không tồn tại");
        }
        theLoai.setMaTheLoai(maTheLoai);
        return theLoaiRepository.save(theLoai);
    }

    public void deleteTheLoai(String maTheLoai) {
        if (!theLoaiRepository.existsByMaTheLoai(maTheLoai)) {
            throw new RuntimeException("Thể loại không tồn tại");
        }
        theLoaiRepository.deleteById(maTheLoai);
    }
}