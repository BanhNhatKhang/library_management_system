package com.example.webapp.controllers.uudai;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.dto.*;
import com.example.webapp.services.UuDaiService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/uudai")
public class UuDaiController {

    @Autowired
    private UuDaiService uuDaiService;

    @GetMapping
    public List<UuDaiDTO> getAllUuDai() {
        return uuDaiService.getAllUuDai();
    }

    @GetMapping("/id/{maUuDai}")
    public UuDaiDTO getUuDaiById(@PathVariable String maUuDai) {
        return uuDaiService.getUuDaiById(maUuDai)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy ưu đãi với mã: " + maUuDai));
    }

    @GetMapping("/ngaybatdau/{ngayBatDau}")
    public List<UuDaiDTO> getUuDaiByNgayBatDau(@PathVariable LocalDate ngayBatDau) {
        return uuDaiService.getUuDaiByNgayBatDau(ngayBatDau);
    }

    @GetMapping("/ngayketthuc/{ngayKetThuc}")
    public List<UuDaiDTO> getUuDaiByNgayKetThuc(@PathVariable LocalDate ngayKetThuc) {
        return uuDaiService.getUuDaiByNgayKetThuc(ngayKetThuc);
    }

    @GetMapping("/sach/{maUuDai}")
    public List<SachDTO> getSachByUuDaiId(@PathVariable String maUuDai) {
        return uuDaiService.getSachByUuDaiId(maUuDai); 
    }

    @PostMapping
    public UuDaiDTO createUuDai(@RequestBody UuDaiDTO uuDaiDTO) {
        return uuDaiService.saveUuDai(uuDaiDTO);
    }

    @PutMapping("/{maUuDai}")
    public UuDaiDTO updateUuDai(@PathVariable String maUuDai, @RequestBody UuDaiDTO uuDaiDTO) {
        return uuDaiService.updateUuDai(maUuDai, uuDaiDTO);
    }

    @DeleteMapping("/{maUuDai}")
    public String deleteUuDai(@PathVariable String maUuDai) {
        uuDaiService.deleteUuDai(maUuDai);
        return "Ưu đãi với mã " + maUuDai + " đã được xóa";
    }
}