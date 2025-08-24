package com.example.webapp.controllers.nxb;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
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
    public List<NhaXuatBanDTO> getAllNhaXuatBan() {
        return nhaXuatBanService.getAllNhaXuatBan();
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

    @DeleteMapping("/{maNhaXuatBan}")
    public String deleteNhaXuatBan(@PathVariable String maNhaXuatBan) {
        nhaXuatBanService.deleteNhaXuatBan(maNhaXuatBan);
        return "Nhà xuất bản với mã " + maNhaXuatBan + " đã được xóa thành công";
    }
}