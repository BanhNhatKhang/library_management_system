package com.example.webapp.controllers.nxb;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import com.example.webapp.dto.*;
import com.example.webapp.models.NhaXuatBan;
import com.example.webapp.services.NhaXuatBanService;

import java.util.List;

@RestController
@RequestMapping("/api/nhaxuatban")
public class NhaXuatBanController {
    
    @Autowired
    private NhaXuatBanService nhaXuatBanService;

    @GetMapping
    public List<NhaXuatBanDTO> getAllNhaXuatBan(@RequestParam(value = "onlyActive", required = false) Boolean onlyActive) {
        return nhaXuatBanService.getAllNhaXuatBan(onlyActive);
    }

    @GetMapping("/{maNhaXuatBan}")
    public NhaXuatBanDTO getNhaXuatBanById(@PathVariable String maNhaXuatBan) {
        return nhaXuatBanService.getNhaXuatBanById(maNhaXuatBan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà xuất bản với mã: " + maNhaXuatBan));
    }

    @PostMapping
    public NhaXuatBan createNhaXuatBan(@RequestBody NhaXuatBan nhaXuatBan) {
        return nhaXuatBanService.saveNhaXuatBan(nhaXuatBan);
    }

    @PutMapping("/{maNhaXuatBan}")
    public NhaXuatBan updateNhaXuatBan(@PathVariable String maNhaXuatBan, @RequestBody NhaXuatBan nhaXuatBan) {
        return nhaXuatBanService.updateNhaXuatBan(maNhaXuatBan, nhaXuatBan);
    }

        @PatchMapping("/{maNhaXuatBan}/lock")
    public ResponseEntity<String> lockNhaXuatBan(@PathVariable String maNhaXuatBan) {
        nhaXuatBanService.lockNhaXuatBan(maNhaXuatBan);
        return ResponseEntity.ok("Đã khóa NXB " + maNhaXuatBan);
    }

    @PatchMapping("/{maNhaXuatBan}/unlock")
    public ResponseEntity<String> unlockNhaXuatBan(@PathVariable String maNhaXuatBan) {
        nhaXuatBanService.unlockNhaXuatBan(maNhaXuatBan);
        return ResponseEntity.ok("Đã mở khóa NXB " + maNhaXuatBan);
    }

    @DeleteMapping("/{maNhaXuatBan}")
    public String deleteOrLockNhaXuatBan(@PathVariable String maNhaXuatBan) {
        nhaXuatBanService.lockNhaXuatBan(maNhaXuatBan);
        return "Nhà xuất bản với mã " + maNhaXuatBan + " đã được khóa";
    }
}