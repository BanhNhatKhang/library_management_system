package com.example.webapp.services;

import com.example.webapp.models.*;
import com.example.webapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Optional;

@Service
public class SachService {

    @Autowired
    private SachRepository sachRepository;
    @Autowired
    private NhaXuatBanRepository nhaXuatBanRepository;
    @Autowired
    private TheLoaiRepository theLoaiRepository;

    public List<Sach> getAllSach() {
        return sachRepository.findAll();
    }

    public Optional<Sach> getSachById(String maSach) {
        return sachRepository.findByMaSach(maSach);
    }

    public Optional<Sach> getSachByTen(String tenSach) {
        return sachRepository.findByTenSach(tenSach);
    }

    public List<Sach> getSachByTacGia(String tacGia) {
        return sachRepository.findByTacGia(tacGia);
    }

    public List<Sach> getSachByNhaXuatBan(String tenNhaXuatBan) {
        return sachRepository.findByNhaXuatBan_TenNhaXuatBan(tenNhaXuatBan);
    }

    public Sach saveSach(Sach sach, String maNhaXuatBan, List<String> maTheLoaiList) {      
        NhaXuatBan nxb = nhaXuatBanRepository.findById(maNhaXuatBan)
            .orElseThrow(() -> new RuntimeException("Nhà xuất bản không tồn tại"));
        sach.setNhaXuatBan(nxb);
            
        Set<TheLoai> theLoais = new HashSet<>();
        for (String maTheLoai : maTheLoaiList) {
            TheLoai tl = theLoaiRepository.findById(maTheLoai)
                .orElseThrow(() -> new RuntimeException("Thể loại không tồn tại"));
            theLoais.add(tl);
        }
        sach.setTheLoais(theLoais);

        return sachRepository.save(sach);
    }

    public Sach updateSach(String maSach, Sach Sach) {
        if (!sachRepository.existsById(maSach) || !sachRepository.existsByTenSach(Sach.getTenSach())) {
            throw new RuntimeException("Thông tin ưu đãi không hợp lệ hoặc không tồn tại");
        }
        Sach.setMaSach(maSach);
        return sachRepository.save(Sach);
    }

    public void deleteSach(String maSach) {
        sachRepository.deleteById(maSach);
    }
}