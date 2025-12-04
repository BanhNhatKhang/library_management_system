package com.example.webapp.controllers.theodoimuonsach;

import com.example.webapp.dto.TheoDoiMuonSachDTO;
import com.example.webapp.models.*;
import com.example.webapp.services.TheoDoiMuonSachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.time.LocalDate.parse;

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

    @GetMapping("/sach/{maSach}")
    public List<TheoDoiMuonSachDTO> getByMaSach(@PathVariable String maSach) {
        return theoDoiMuonSachService.getByMaSach(maSach);
    }

    @GetMapping("/item")
    public ResponseEntity<TheoDoiMuonSachDTO> getById(@RequestParam String maDocGia, @RequestParam String maSach, @RequestParam String ngayMuon) {
        try {
            System.out.println("Controller: Fetching item with maDocGia=" + maDocGia + ", maSach=" + maSach + ", ngayMuon=" + ngayMuon);
            
            TheoDoiMuonSachId id = new TheoDoiMuonSachId(maDocGia, maSach, parse(ngayMuon));
            Optional<TheoDoiMuonSach> theoDoiOpt = theoDoiMuonSachService.findById(id);
            
            if (theoDoiOpt.isPresent()) {
                TheoDoiMuonSach theoDoi = theoDoiOpt.get();
                System.out.println("Found entity: " + theoDoi.getId().getMaDocGia());
                System.out.println("DocGia not null: " + (theoDoi.getDocGia() != null));
                System.out.println("Sach not null: " + (theoDoi.getSach() != null));
                
                // SỬA: Gọi service method đúng cách
                TheoDoiMuonSachDTO dto = theoDoiMuonSachService.convertToDTO(theoDoi);
                
                System.out.println("DTO DocGia not null: " + (dto.getDocGia() != null));
                System.out.println("DTO Sach not null: " + (dto.getSach() != null));
                
                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/admin/all")
    public List<TheoDoiMuonSachDTO> getAllForAdmin() {
        return theoDoiMuonSachService.getAll();
    }

    @GetMapping("/admin/{maDocGia}")
    public List<TheoDoiMuonSachDTO> getByMaDocGiaForAdmin(@PathVariable String maDocGia) {
        return theoDoiMuonSachService.getByMaDocGia(maDocGia);
    }

    @PostMapping
    public TheoDoiMuonSachDTO create(@RequestBody TheoDoiMuonSachDTO dto) {
        return theoDoiMuonSachService.save(dto);
    }

    @PutMapping
    public TheoDoiMuonSachDTO update(@RequestBody TheoDoiMuonSachDTO dto) {
        return theoDoiMuonSachService.update(dto);
    }

    @PutMapping("/admin/update-status")
    public ResponseEntity<?> updateBorrowStatusForAdmin(@RequestBody TheoDoiMuonSachDTO request) {
        try {
            TheoDoiMuonSachDTO updatedDTO = theoDoiMuonSachService.update(request);
            return ResponseEntity.ok(updatedDTO);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật trạng thái: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }

    @PutMapping("/admin/bulk-update")
    public List<TheoDoiMuonSachDTO> bulkUpdateBorrowStatus(@RequestBody List<TheoDoiMuonSachDTO> dtoList) {
        return dtoList.stream()
                .map(dto -> theoDoiMuonSachService.update(dto))
                .collect(Collectors.toList());
    }

    @DeleteMapping
    public void delete(@RequestParam String maDocGia, @RequestParam String maSach, @RequestParam String ngayMuon) {
        TheoDoiMuonSachId id = new TheoDoiMuonSachId(maDocGia, maSach, parse(ngayMuon));
        theoDoiMuonSachService.delete(id);
    }
}