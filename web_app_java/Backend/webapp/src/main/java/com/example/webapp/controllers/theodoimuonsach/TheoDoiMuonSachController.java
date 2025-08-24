package com.example.webapp.controllers.theodoimuonsach;

import com.example.webapp.dto.TheoDoiMuonSachDTO;
import com.example.webapp.models.TheoDoiMuonSachId;
import com.example.webapp.services.TheoDoiMuonSachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/theodoimuonsach")
public class TheoDoiMuonSachController {

    @Autowired
    private TheoDoiMuonSachService theoDoiMuonSachService;

    @GetMapping
    public List<TheoDoiMuonSachDTO> getAll() {
        return theoDoiMuonSachService.getAll();
    }

    @GetMapping("/{maDocGia}")
    public List<TheoDoiMuonSachDTO> getByMaDocGia(@PathVariable String maDocGia) {
        return theoDoiMuonSachService.getByMaDocGia(maDocGia);
    }

    @GetMapping("/item")
    public Optional<TheoDoiMuonSachDTO> getById(@RequestParam String maDocGia, @RequestParam String maSach, @RequestParam String ngayMuon) {
        TheoDoiMuonSachId id = new TheoDoiMuonSachId(maDocGia, maSach, java.time.LocalDate.parse(ngayMuon));
        return theoDoiMuonSachService.getById(id);
    }

    @PostMapping
    public TheoDoiMuonSachDTO create(@RequestBody TheoDoiMuonSachDTO dto) {
        return theoDoiMuonSachService.save(dto);
    }

    @PutMapping
    public TheoDoiMuonSachDTO update(@RequestBody TheoDoiMuonSachDTO dto) {
        return theoDoiMuonSachService.update(dto);
    }

    @DeleteMapping
    public void delete(@RequestParam String maDocGia, @RequestParam String maSach, @RequestParam String ngayMuon) {
        TheoDoiMuonSachId id = new TheoDoiMuonSachId(maDocGia, maSach, java.time.LocalDate.parse(ngayMuon));
        theoDoiMuonSachService.delete(id);
    }
}