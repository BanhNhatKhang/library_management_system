package com.example.webapp.controllers.sach;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

// import com.example.webapp.models.Sach;
import com.example.webapp.dto.*;
import com.example.webapp.services.SachService;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @GetMapping("/goi-y/{maSach}") 
    public List<SachDTO> getSachGoiY(@PathVariable String maSach) {
        return sachService.getSachGoiY(maSach);
    }

    @GetMapping("/theloai/{maTheLoai}")
    public List<SachDTO> getSachByMaTheLoai(@PathVariable String maTheLoai) {
        return sachService.getSachByMaTheLoai(maTheLoai);
    }

    @GetMapping("/image/{folder}/{filename}")
    public ResponseEntity<Resource> getImage(
            @PathVariable String folder,
            @PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads", folder, filename);
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new FileSystemResource(filePath);
            String contentType = Files.probeContentType(filePath);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType != null ? contentType : "image/jpeg")
                    .body(resource);
                    
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/next-ma")
    public ResponseEntity<String> getNextMaSach() {
        String next = sachService.generateNextMaSach();
        return ResponseEntity.ok(next);
    }

    @PostMapping
    public ResponseEntity<SachDTO> createSach(
            @RequestParam("tenSach") String tenSach,
            @RequestParam("soQuyen") int soQuyen,
            @RequestParam("donGia") String donGia,
            @RequestParam("soLuong") int soLuong,
            @RequestParam("namXuatBan") String namXuatBan,
            @RequestParam("tacGia") String tacGia,
            @RequestParam("moTa") String moTa,
            @RequestParam("nhaXuatBan") String nhaXuatBan,
            @RequestParam("theLoais") String theLoaisJson,
            @RequestParam("anhBia") MultipartFile anhBia) {
        
        try {

            if (sachService.existsByTenSach(tenSach)) {
                return ResponseEntity.badRequest().header("X-Error", "Tên sách đã tồn tại").build();
            }

            ObjectMapper mapper = new ObjectMapper();
            String[] theLoais = mapper.readValue(theLoaisJson, String[].class);
            
            SachDTO sachDTO = sachService.createSach(
                null, tenSach, soQuyen, donGia, soLuong, 
                namXuatBan, tacGia, moTa, nhaXuatBan, 
                theLoais, anhBia
            );
            
            return ResponseEntity.ok(sachDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{maSach}")
    public ResponseEntity<SachDTO> updateSach(
            @PathVariable String maSach,
            @RequestParam("tenSach") String tenSach,
            @RequestParam("soQuyen") int soQuyen,
            @RequestParam("donGia") String donGia,
            @RequestParam("soLuong") int soLuong,
            @RequestParam("namXuatBan") String namXuatBan,
            @RequestParam("tacGia") String tacGia,
            @RequestParam("moTa") String moTa,
            @RequestParam("nhaXuatBan") String nhaXuatBan,
            @RequestParam("theLoais") String theLoaisJson,
            @RequestParam(value = "anhBia", required = false) MultipartFile anhBia) {
        
        try {
            ObjectMapper mapper = new ObjectMapper();
            String[] theLoais = mapper.readValue(theLoaisJson, String[].class);
            
            SachDTO sachDTO = sachService.updateSach(
                maSach, tenSach, soQuyen, donGia, soLuong, 
                namXuatBan, tacGia, moTa, nhaXuatBan, 
                theLoais, anhBia
            );
            
            return sachDTO != null ? ResponseEntity.ok(sachDTO) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{maSach}")
    public ResponseEntity<String> deleteSach(@PathVariable String maSach) {
        try {
            boolean deleted = sachService.deleteSach(maSach);
            return deleted ? ResponseEntity.ok("Deleted") : ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            // Sách đang được mượn
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Không thể xóa sách do ràng buộc dữ liệu: " + ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi xóa sách");
        }
    }
}