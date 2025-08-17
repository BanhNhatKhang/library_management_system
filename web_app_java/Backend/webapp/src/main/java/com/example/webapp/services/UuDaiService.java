package com.example.webapp.services;

import com.example.webapp.models.UuDai;
import com.example.webapp.repository.UuDaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@Service
public class UuDaiService {

    @Autowired
    private UuDaiRepository uuDaiRepository;

    public List<UuDai> getAllUuDai() {
        return uuDaiRepository.findAll();
    }

    public List<UuDai> getUuDaiByNgayBatDau(LocalDate ngayBatDau) {
        return uuDaiRepository.findByNgayBatDau(ngayBatDau);
    }

    public List<UuDai> getUuDaiByNgayKetThuc(LocalDate ngayKetThuc) {
        return uuDaiRepository.findByNgayKetThuc(ngayKetThuc);
    }

    public Optional<UuDai> getUuDaiById(String maUuDai) {
        return uuDaiRepository.findByMaUuDai(maUuDai);
    }

    public UuDai saveUuDai(UuDai uuDai) {
        return uuDaiRepository.save(uuDai);
    }

    public UuDai updateUuDai(String maUuDai, UuDai uuDai) {
        if (!uuDaiRepository.existsByMaUuDai(maUuDai)) {
            throw new RuntimeException("Thông tin ưu đãi không hợp lệ hoặc không tồn tại");
        }
        uuDai.setMaUuDai(maUuDai);
        return uuDaiRepository.save(uuDai);
    }

    public void deleteUuDai(String maUuDai) {
        if (!uuDaiRepository.existsByMaUuDai(maUuDai)) {
            throw new RuntimeException("Ưu đãi không tồn tại");
        }
        uuDaiRepository.deleteById(maUuDai);
    }
}