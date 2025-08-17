package com.example.webapp.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.models.UuDai;
import com.example.webapp.services.UuDaiService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/uudai")
public class UuDaiController {

    @Autowired
    private UuDaiService uuDaiService;

    @GetMapping
    public List<UuDai> getAllUuDai() {
        return uuDaiService.getAllUuDai();
    }

    @GetMapping("/id/{maUuDai}")
    public UuDai getUuDaiById(@PathVariable String maUuDai) {
        return uuDaiService.getUuDaiById(maUuDai).orElseThrow(() -> new RuntimeException("Không tìm thấy ưu đãi với mã: "+maUuDai));
    }

    @GetMapping("/ngaybatdau/{ngayBatDau}")
    public List<UuDai> getUuDaiByNgayBatDau(@PathVariable LocalDate ngayBatDau) {
        return uuDaiService.getUuDaiByNgayBatDau(ngayBatDau);
    }

    @GetMapping("/ngayketthuc/{ngayKetThuc}")
    public List<UuDai> getUuDaiByNgayKetThuc(@PathVariable LocalDate ngayKetThuc) {
        return uuDaiService.getUuDaiByNgayKetThuc(ngayKetThuc);
    }

    @PostMapping
    public UuDai createUuDai(@RequestBody UuDai uuDai) {
        return uuDaiService.saveUuDai(uuDai);
    }

    @PutMapping("/{maUuDai}")
    public UuDai updateUuDai(@PathVariable String maUuDai, @RequestBody UuDai uuDai) {
        return uuDaiService.updateUuDai(maUuDai, uuDai);
    }

    @DeleteMapping("/{maUuDai}")
    public String deleteUuDai(@PathVariable String maUuDai) {
        uuDaiService.deleteUuDai(maUuDai);
        return "Ưu đãi với mã " + maUuDai + " đã được xóa";
    }

}