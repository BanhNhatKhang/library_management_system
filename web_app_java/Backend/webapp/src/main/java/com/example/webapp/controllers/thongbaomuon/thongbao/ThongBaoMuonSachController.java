package com.example.webapp.controllers.thongbaomuon.thongbao;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.dto.ThongBaoMuonSachDTO;
import com.example.webapp.services.ThongBaoMuonSachService;

import java.util.List;

@RestController
@RequestMapping("/api/thongbao")
public class ThongBaoMuonSachController {

    @Autowired
    private ThongBaoMuonSachService thongBaoMuonSachService;

    @GetMapping
    public List<ThongBaoMuonSachDTO> getAllThongBao() {
        return thongBaoMuonSachService.getAll();
    }

    @GetMapping("/id/{id}")
    public ThongBaoMuonSachDTO getThongBaoById(@PathVariable Long id) {
        return thongBaoMuonSachService.getById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo với id: " + id));
    }

    @GetMapping("/docgia/{maDocGia}")
    public List<ThongBaoMuonSachDTO> getThongBaoByMaDocGia(@PathVariable String maDocGia) {
        return thongBaoMuonSachService.getByMaDocGia(maDocGia);
    }

    @GetMapping("/loai/{loaiThongBao}")
    public List<ThongBaoMuonSachDTO> getThongBaoByLoai(@PathVariable String loaiThongBao) {
        return thongBaoMuonSachService.getByLoaiThongBao(loaiThongBao);
    }

    @GetMapping("/dadoc/{trangThaiDaDoc}")
    public List<ThongBaoMuonSachDTO> getThongBaoByTrangThaiDaDoc(@PathVariable Boolean trangThaiDaDoc) {
        return thongBaoMuonSachService.getByTrangThaiDaDoc(trangThaiDaDoc);
    }

    @PostMapping
    public ThongBaoMuonSachDTO createThongBao(@RequestBody ThongBaoMuonSachDTO dto) {
        return thongBaoMuonSachService.save(dto);
    }

    @DeleteMapping("/{id}")
    public String deleteThongBao(@PathVariable Long id) {
        thongBaoMuonSachService.deleteById(id);
        return "Thông báo với id " + id + " đã được xóa thành công";
    }
}