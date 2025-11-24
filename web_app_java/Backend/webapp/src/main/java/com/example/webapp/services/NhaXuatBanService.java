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

    public List<NhaXuatBanDTO> getAllNhaXuatBan(Boolean onlyActive) {
        return nhaXuatBanRepository.findAll().stream()
                .filter(nxb -> {
                    if (onlyActive == null) return true;
                    if (onlyActive) return nxb.getTrangThai() == NhaXuatBan.TrangThaiNXB.MOKHOA;
                    return true;
                })
                .map(this::toDTO)
                .toList();
    }

    public Optional<NhaXuatBanDTO> getNhaXuatBanById(String maNhaXuatBan) {
        return nhaXuatBanRepository.findById(maNhaXuatBan).map(this::toDTO);
    }

    public NhaXuatBan saveNhaXuatBan(NhaXuatBan nhaXuatBan) {
        if (nhaXuatBan.getMaNhaXuatBan() == null || nhaXuatBan.getMaNhaXuatBan().trim().isEmpty()) {
            nhaXuatBan.setMaNhaXuatBan(generateNextMaNXB());
        }
        return nhaXuatBanRepository.save(nhaXuatBan);
    }

    public NhaXuatBan updateNhaXuatBan(String maNhaXuatBan, NhaXuatBan nhaXuatBan) {
        if (!nhaXuatBanRepository.existsByMaNhaXuatBan(maNhaXuatBan)) {
            throw new RuntimeException("Thông tin nhà xuất bản không hợp lệ hoặc không tồn tại");
        }
        nhaXuatBan.setMaNhaXuatBan(maNhaXuatBan);
        return nhaXuatBanRepository.save(nhaXuatBan);
    }

    // khóa
    public void lockNhaXuatBan(String maNhaXuatBan) {
        Optional<NhaXuatBan> opt = nhaXuatBanRepository.findById(maNhaXuatBan);
        if (opt.isEmpty()) throw new RuntimeException("Không tìm thấy nhà xuất bản: " + maNhaXuatBan);
        NhaXuatBan nxb = opt.get();
        nxb.setTrangThai(NhaXuatBan.TrangThaiNXB.DAKHOA);
        nhaXuatBanRepository.save(nxb);
    }

    // mở khóa
    public void unlockNhaXuatBan(String maNhaXuatBan) {
        Optional<NhaXuatBan> opt = nhaXuatBanRepository.findById(maNhaXuatBan);
        if (opt.isEmpty()) throw new RuntimeException("Không tìm thấy nhà xuất bản: " + maNhaXuatBan);
        NhaXuatBan nxb = opt.get();
        nxb.setTrangThai(NhaXuatBan.TrangThaiNXB.MOKHOA);
        nhaXuatBanRepository.save(nxb);
    }

    public void deleteNhaXuatBan(String maNhaXuatBan) {
        nhaXuatBanRepository.deleteById(maNhaXuatBan);
    }

    public String generateNextMaNXB() {
        List<NhaXuatBan> all = nhaXuatBanRepository.findAll();
        int max = 0;
        for (NhaXuatBan n : all) {
            String ma = n.getMaNhaXuatBan();
            if (ma == null) continue;
            String up = ma.toUpperCase();
            // chỉ xét các mã bắt đầu bằng NXB
            if (!up.startsWith("NXB")) continue;
            String digits = up.replaceAll("\\D+", "");
            if (digits.isEmpty()) continue;
            try {
                int val = Integer.parseInt(digits);
                if (val > max) max = val;
            } catch (NumberFormatException ignored) {}
        }
        int next = max + 1;
        return "NXB" + String.format("%03d", next);
    }

    public NhaXuatBanDTO toDTO(NhaXuatBan nhaXuatBan) {
        NhaXuatBanDTO nhaXuatBanDTO = new NhaXuatBanDTO();
        nhaXuatBanDTO.setMaNhaXuatBan(nhaXuatBan.getMaNhaXuatBan());
        nhaXuatBanDTO.setTenNhaXuatBan(nhaXuatBan.getTenNhaXuatBan());
        nhaXuatBanDTO.setDiaChi(nhaXuatBan.getDiaChi());
        if (nhaXuatBan.getTrangThai() != null) {
            nhaXuatBanDTO.setTrangThai(
                NhaXuatBanDTO.TrangThaiNXB.valueOf(nhaXuatBan.getTrangThai().name())
            );
        }
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