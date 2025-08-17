package   com.example.webapp.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.models.DocGia;
import com.example.webapp.services.DocGiaService;

import java.util.List;

@RestController
@RequestMapping("/api/docgia")
public class DocGiaController {

    @Autowired
    private DocGiaService docGiaService;

    @GetMapping
    public List<DocGia> getAllDocGia() {
        return docGiaService.getAllDocGia();
    }

    @GetMapping("/{maDocGia}")
    public DocGia getDocGiaById(@PathVariable String maDocGia) {
        return docGiaService.getDocGiaById(maDocGia)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy độc giả với mã: " + maDocGia));
    }

    @PostMapping
    public DocGia createDocGia(@RequestBody DocGia docGia) {
        return docGiaService.saveDocGia(docGia);
    }

    @PutMapping("/{maDocGia}")
    public DocGia updateDocGia(@PathVariable String maDocGia, @RequestBody DocGia docGia) {
        return docGiaService.updateDocGia(maDocGia, docGia);
    }

    @DeleteMapping("/{maDocGia}")
    public String deleteDocGia(@PathVariable String maDocGia) {
        docGiaService.deleteDocGia(maDocGia);
        return "Độc giả với mã " + maDocGia + " đã được xóa thành công";
    }

}