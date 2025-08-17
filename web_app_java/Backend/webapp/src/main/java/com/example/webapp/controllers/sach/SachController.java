package com.example.webapp.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.models.Sach;
import com.example.webapp.dto.*;
import com.example.webapp.services.SachService;

import java.util.List;

@RestController
@RequestMapping("/api/sach")
public class SachController {

    @Autowired
    private SachService sachService;

    private Sach convertToSachEntity(SachDTO sachDTO) {
        Sach sach = new Sach();
        sach.setMaSach(sachDTO.getMaSach());
        sach.setTenSach(sachDTO.getTenSach());
        sach.setSoQuyen(sachDTO.getSoQuyen());
        sach.setDonGia(sachDTO.getDonGia());
        sach.setSoLuong(sachDTO.getSoLuong());
        sach.setNamXuatBan(sachDTO.getNamXuatBan());
        sach.setTacGia(sachDTO.getTacGia());
        sach.setMoTa(sachDTO.getMoTa());
        sach.setAnhBia(sachDTO.getAnhBia());
        sach.setDiemDanhGia(sachDTO.getDiemDanhGia());
        sach.setGiamGia(sachDTO.getGiamGia());
        return sach;
    }

    @GetMapping
    public List<Sach> getAllSach() {
        return sachService.getAllSach();
    }

    @GetMapping("/ten/{tenSach}")
    public Sach getSachByTen(@PathVariable String tenSach) {
        return sachService.getSachByTen(tenSach)
                .orElseThrow (() -> new RuntimeException("Không tìm thấy sách với tên sách: " + tenSach));
    }

    @GetMapping("/id/{maSach}")
    public Sach getSachByMaSach(@PathVariable String maSach) {
        return sachService.getSachById(maSach)
                .orElseThrow (() -> new RuntimeException("Không tìm thấy sách có mã sách: " + maSach));
    }

    @GetMapping("/tacgia/{tenTacGia}")
    public List<Sach> getSachByTenTacGia(@PathVariable String tacGia) {
        return sachService.getSachByTacGia(tacGia);
    }

    @GetMapping("/nxb/{tenNhaXuatBan}")
    public List<Sach> getSachByNhaXuatBan(@PathVariable String tenNhaXuatBan) {
        return sachService.getSachByNhaXuatBan(tenNhaXuatBan);
    }

    @PostMapping
    public Sach createSach(@RequestBody SachRequestDTO request) {
        Sach sach = convertToSachEntity(request.getSach());
        return sachService.saveSach(sach, request.getMaNhaXuatBan(), request.getMaTheLoaiList());
    }

    @PutMapping("/{maSach}")
    public Sach updateSach(@PathVariable String maSach, @RequestBody Sach sach) {
        return sachService.updateSach(maSach, sach);
    }

    @DeleteMapping("/{maSach}")
    public String deleteSach(@PathVariable String maSach) {
        sachService.deleteSach(maSach);
        return "Sách với mã " + maSach + " đã được xóa thành công";
    }

}