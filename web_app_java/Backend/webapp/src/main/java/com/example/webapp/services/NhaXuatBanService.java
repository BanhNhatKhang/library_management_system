package com.example.webapp.services;

import com.example.webapp.models.NhaXuatBan;
import com.example.webapp.dto.NhaXuatBanDTO;
import com.example.webapp.repository.NhaXuatBanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NhaXuatBanService {

    @Autowired
    private NhaXuatBanRepository nhaXuatBanRepository;

    public List<NhaXuatBanDTO> getAllNhaXuatBan() {
        return nhaXuatBanRepository.findAll().stream().map(this::toDTO).toList();
    }

    public Optional<NhaXuatBanDTO> getNhaXuatBanById(String maNhaXuatBan) {
        return nhaXuatBanRepository.findById(maNhaXuatBan).map(this::toDTO);
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

    public NhaXuatBanDTO toDTO(NhaXuatBan nhaXuatBan) {
        NhaXuatBanDTO nhaXuatBanDTO = new NhaXuatBanDTO();
        nhaXuatBanDTO.setMaNhaXuatBan(nhaXuatBan.getMaNhaXuatBan());
        nhaXuatBanDTO.setTenNhaXuatBan(nhaXuatBan.getTenNhaXuatBan());
        nhaXuatBanDTO.setDiaChi(nhaXuatBan.getDiaChi());
        return nhaXuatBanDTO;
    }

    public NhaXuatBan toEntity(NhaXuatBanDTO nhaXuatBanDTO) {
        NhaXuatBan nhaXuatBan = new NhaXuatBan();
        nhaXuatBan.setMaNhaXuatBan(nhaXuatBanDTO.getMaNhaXuatBan());
        nhaXuatBan.setTenNhaXuatBan(nhaXuatBanDTO.getTenNhaXuatBan());
        nhaXuatBan.setDiaChi(nhaXuatBanDTO.getDiaChi());
        return nhaXuatBan;
    }
}