package   com.example.webapp.controllers.khachhang.docgia;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.models.DocGia;
import org.springframework.http.ResponseEntity;
import com.example.webapp.dto.*;
import com.example.webapp.services.DocGiaService;
import com.example.webapp.services.TheoDoiMuonSachService;

import java.security.Principal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/docgia")
public class DocGiaController {

    @Autowired
    private DocGiaService docGiaService;

    @Autowired
    private TheoDoiMuonSachService theoDoiMuonSachService;

    @GetMapping
    public List<DocGiaDTO> getAllDocGia() {
        return docGiaService.getAllDocGia();
    }

    @GetMapping("/{maDocGia}")
    public DocGiaDTO getDocGiaById(@PathVariable String maDocGia) {
        return docGiaService.getDocGiaById(maDocGia)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy độc giả với mã: " + maDocGia));
    }

    @GetMapping("/thongtin/me")
    public DocGiaDTO getDocGiaMe(Principal principal) {
        // Sửa lại để truyền principal vào method
        return docGiaService.getDocGiaByPrincipal(principal); 
    }
    
    @GetMapping("/diachi/me")
    public String getDiaChiMe(Principal principal) {
        // Lấy thông tin độc giả và trả về địa chỉ
        DocGiaDTO docGia = docGiaService.getDocGiaByPrincipal(principal);
        return docGia.getDiaChi();
    }

    @GetMapping("/donhang/me")
    public ResponseEntity<Page<DonHangDTO>> getMyOrdersPaginated(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "ngayDat") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        String username = principal.getName();
        
        // Tạo Pageable object
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<DonHangDTO> orders = docGiaService.getDonHangByEmailPaginated(username, pageable);
        return ResponseEntity.ok(orders);
    }

    // Endpoint trả về tất cả đơn hàng (không phân trang) để tính thống kê
    @GetMapping("/donhang/me/all")
    public List<DonHangDTO> getMyOrdersAll(Principal principal) {
        String username = principal.getName();
        return docGiaService.getDonHangByEmail(username);
    }

    @PutMapping("/doimatkhau/me")
    public String changePassword(Principal principal, @RequestBody DoiMatKhauRequestDTO request) {
        return docGiaService.changePassword(principal, request);
    }
    
    @PostMapping
    public DocGia createDocGia(@RequestBody DocGia docGia) {
        return docGiaService.saveDocGia(docGia);
    }

    @PutMapping("/{maDocGia}")
    public DocGia updateDocGia(@PathVariable String maDocGia, @RequestBody DocGia docGia) {
        return docGiaService.updateDocGia(maDocGia, docGia);
    }

    @PutMapping("/thongtin/me")
    public DocGiaDTO updateDocGiaMe(Principal principal, @RequestBody DocGiaDTO docGiaDTO) {
        return docGiaService.updateDocGiaByPrincipal(principal, docGiaDTO);
    }

    @DeleteMapping("/{maDocGia}")
    public String deleteDocGia(@PathVariable String maDocGia) {
        docGiaService.deleteDocGia(maDocGia);
        return "Độc giả với mã " + maDocGia + " đã được xóa thành công";
    }

    @GetMapping("/theodoimuon/me")
    public ResponseEntity<Page<TheoDoiMuonSachDTO>> getMyBorrowedBooksPaginated(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id.ngayMuon") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            // Sử dụng method đã có sẵn trong DocGiaService
            DocGiaDTO docGiaDTO = docGiaService.getDocGiaByPrincipal(principal);
            if (docGiaDTO == null) {
                return ResponseEntity.notFound().build();
            }

            // Tạo Pageable với sort direction
            Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            // Lấy danh sách sách đã mượn có phân trang
            Page<TheoDoiMuonSachDTO> borrowedBooks = theoDoiMuonSachService
                .getByMaDocGiaPaginated(docGiaDTO.getMaDocGia(), pageable);

            return ResponseEntity.ok(borrowedBooks);
        } catch (Exception e) {
            System.err.println("Error in getMyBorrowedBooksPaginated: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Giữ nguyên method cũ cho trường hợp không phân trang
    @GetMapping("/theodoimuon/me/all")
    public List<TheoDoiMuonSachDTO> getMySachDaMuon(Principal principal) {
        DocGiaDTO docGia = docGiaService.getDocGiaByPrincipal(principal);
        return theoDoiMuonSachService.getByMaDocGia(docGia.getMaDocGia());
    }

}