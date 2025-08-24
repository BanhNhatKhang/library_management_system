package com.example.webapp.controllers.giohang;

import com.example.webapp.dto.GioHangDTO;
import com.example.webapp.models.GioHangId;
import com.example.webapp.services.GioHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/giohang")
public class GioHangController {

    @Autowired
    private GioHangService gioHangService;

    
    @GetMapping("/{maDocGia}")
    public List<GioHangDTO> getGioHangByDocGia(@PathVariable String maDocGia) {
        return gioHangService.getGioHangsByMaDocGia(maDocGia);
    }

   
    @PostMapping
    public GioHangDTO addToGioHang(@RequestBody GioHangDTO gioHangDTO) {
        return gioHangService.saveGioHang(gioHangDTO);
    }

    
    @PutMapping
    public GioHangDTO updateGioHang(@RequestBody GioHangDTO gioHangDTO) {
        return gioHangService.updateGioHang(gioHangDTO);
    }

    
    @DeleteMapping
    public String deleteGioHangItem(@RequestBody GioHangDTO gioHangDTO) {
        GioHangId id = new GioHangId(gioHangDTO.getMaDocGia(), gioHangDTO.getMaSach());
        gioHangService.deleteGioHang(id);
        return "Giỏ hàng được xóa thành công";
    }
    
    @DeleteMapping("/all/{maDocGia}")
    public void deleteAllGioHangByDocGia(@PathVariable String maDocGia) {
        gioHangService.deleteAllGioHangByDocGia(maDocGia);
    }
}