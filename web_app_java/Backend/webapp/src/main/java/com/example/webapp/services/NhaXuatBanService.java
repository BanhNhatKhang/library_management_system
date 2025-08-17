package com.example.webapp.services;

import com.example.webapp.models.NhaXuatBan;
import com.example.webapp.repository.NhaXuatBanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NhaXuatBanService {

    @Autowired
    private NhaXuatBanRepository nhaXuatBanRepository;

    public List<NhaXuatBan> getAllNhaXuatBan() {
        return nhaXuatBanRepository.findAll();
    }

    public Optional<NhaXuatBan> getNhaXuatBanById(String maNhaXuatBan) {
        return nhaXuatBanRepository.findById(maNhaXuatBan);
    }

    public NhaXuatBan saveNhaXuatBan(NhaXuatBan nhaXuatBan) {
        return nhaXuatBanRepository.save(nhaXuatBan);
    }

    public NhaXuatBan updateNhaXuatBan(String maNhaXuatBan, NhaXuatBan nhaXuatBan) {
        if (!nhaXuatBanRepository.existsByMaNhaXuatBan(maNhaXuatBan)) {
            throw new RuntimeException("Thông tin nhà xuất bản không hợp lệ hoặc không tồn tại");
        }
        nhaXuatBan.setMaNhaXuatBan(maNhaXuatBan);
        return nhaXuatBanRepository.save(nhaXuatBan);
    }

    public void deleteNhaXuatBan(String maNhaXuatBan) {
        nhaXuatBanRepository.deleteById(maNhaXuatBan);
    }
}