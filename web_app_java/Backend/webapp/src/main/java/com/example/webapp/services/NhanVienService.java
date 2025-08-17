package com.example.webapp.services;

import com.example.webapp.models.NhanVien;
import com.example.webapp.repository.NhanVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NhanVienService {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    public List<NhanVien> getAllNhanVien() {
        return nhanVienRepository.findAll();
    }

    public Optional<NhanVien> getNhanVienById(String maNhanVien) {
        return nhanVienRepository.findById(maNhanVien);
    }

    public NhanVien saveNhanVien(NhanVien nhanVien) {
        return nhanVienRepository.save(nhanVien);
    }

    public NhanVien updateNhanVien(String maNhanVien, NhanVien nhanVien) {
        if (!nhanVienRepository.existsByMaNhanVien(maNhanVien) || !nhanVienRepository.existsByEmail(nhanVien.getEmail()) || !nhanVienRepository.existsByDienThoai(nhanVien.getDienThoai())) {
            throw new RuntimeException("Thông tin nhân viên không hợp lệ hoặc đã tồn tại");
        }
        nhanVien.setMaNhanVien(maNhanVien);
        return nhanVienRepository.save(nhanVien);
    }

    public void deleteNhanVien(String maNhanVien) {
        nhanVienRepository.deleteById(maNhanVien);
    }
}