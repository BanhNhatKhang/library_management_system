package com.example.webapp.controllers.giohang;

import com.example.webapp.dto.GioHangDTO;
import com.example.webapp.dto.GioHangResponseDTO;
import com.example.webapp.services.GioHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/giohang")
public class GioHangController {

    @Autowired
    private GioHangService gioHangService;

    
    @GetMapping("/{emailDocGia}")
    public List<GioHangResponseDTO> getGioHangByDocGia(@PathVariable("emailDocGia") String emailDocGia) {
        return gioHangService.getGioHangsByMaDocGia(emailDocGia);
    }

   
    @PostMapping
    public GioHangDTO addToGioHang(@RequestBody GioHangDTO gioHangDTO) {
        return gioHangService.saveGioHang(gioHangDTO);
    }

    
    // Endpoint mới cho thêm hoặc cập nhật
    @PostMapping("/add")
    public ResponseEntity<?> addOrUpdateGioHang(@RequestBody GioHangDTO gioHangDTO) {
        try {
            GioHangResponseDTO result = gioHangService.addOrUpdateGioHang(gioHangDTO);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Controller error adding/updating cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    @PutMapping
    public ResponseEntity<?> updateGioHang(@RequestBody GioHangDTO gioHangDTO) {
        try {
            GioHangResponseDTO updatedItem = gioHangService.updateGioHang(gioHangDTO);
            return ResponseEntity.ok(updatedItem);
        } catch (Exception e) {
            System.err.println("Controller error updating cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    @DeleteMapping
    public String deleteGioHangItem(@RequestBody GioHangDTO gioHangDTO) {
        try {
            // Sử dụng method mới để xóa theo identifier
            gioHangService.deleteGioHangByIdentifier(gioHangDTO.getMaDocGia(), gioHangDTO.getMaSach());
            return "Xóa sản phẩm khỏi giỏ hàng thành công";
        } catch (Exception e) {
            return "Lỗi: " + e.getMessage();
        }
    }
    
    @DeleteMapping("/all/{docGiaIdentifier}")
    public String deleteAllGioHangByDocGia(@PathVariable String docGiaIdentifier) {
        try {
            // Sử dụng method mới để xóa tất cả theo identifier
            gioHangService.deleteAllGioHangByIdentifier(docGiaIdentifier);
            return "Xóa toàn bộ giỏ hàng thành công";
        } catch (Exception e) {
            return "Lỗi: " + e.getMessage();
        }
    }
}