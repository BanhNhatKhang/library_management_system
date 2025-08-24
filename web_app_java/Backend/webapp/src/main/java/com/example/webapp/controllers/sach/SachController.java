package com.example.webapp.controllers.sach;

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


    @GetMapping
    public List<SachDTO> getAllSach() {
        return sachService.getAllSach();
    }

    @GetMapping("/ten/{tenSach}")
    public SachDTO getSachByTen(@PathVariable String tenSach) {
        return sachService.getSachByTen(tenSach)
                .orElseThrow (() -> new RuntimeException("Không tìm thấy sách với tên sách: " + tenSach));
    }

    @GetMapping("/id/{maSach}")
    public SachDTO getSachByMaSach(@PathVariable String maSach) {
        return sachService.getSachById(maSach)
                .orElseThrow (() -> new RuntimeException("Không tìm thấy sách có mã sách: " + maSach));
    }

    @GetMapping("/tacgia/{tenTacGia}")
    public List<SachDTO> getSachByTenTacGia(@PathVariable String tenTacGia) {
        return sachService.getSachByTacGia(tenTacGia);
    }

    @GetMapping("/nxb/{tenNhaXuatBan}")
    public List<SachDTO> getSachByNhaXuatBan(@PathVariable String tenNhaXuatBan) {
        return sachService.getSachByNhaXuatBan(tenNhaXuatBan);
    }

    @PostMapping
    public Sach createSach(@RequestBody SachRequestDTO request) {
        Sach sach = sachService.toEntity(request.getSach());
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