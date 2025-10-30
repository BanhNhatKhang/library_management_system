package com.example.webapp.controllers.theloai;

import com.example.webapp.dto.TheLoaiDTO;
import com.example.webapp.services.TheLoaiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theloai")
public class TheLoaiController {
    @Autowired
    private TheLoaiService theLoaiService;

    @GetMapping
    public List<TheLoaiDTO> getAllTheLoai() {
        return theLoaiService.getAllTheLoai();
    }

    @GetMapping("/{maTheLoai}")
    public TheLoaiDTO getTheLoaiById(@PathVariable String maTheLoai) {
        return theLoaiService.getTheLoaiById(maTheLoai)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thể loại với mã: " + maTheLoai));
    }

    // Accept optional prefix query param (TL | FB). If provided, service will generate maTheLoai.
    @PostMapping
    public TheLoaiDTO createTheLoai(@RequestBody TheLoaiDTO theLoaiDTO,
                                    @RequestParam(value = "prefix", required = false) String prefix) {
        return theLoaiService.saveTheLoai(theLoaiDTO, prefix);
    }

    @PutMapping("/{maTheLoai}")
    public TheLoaiDTO updateTheLoai(@PathVariable String maTheLoai, @RequestBody TheLoaiDTO theLoaiDTO) {
        return theLoaiService.updateTheLoai(maTheLoai, theLoaiDTO);
    }

    @DeleteMapping("/{maTheLoai}")
    public String deleteTheLoai(@PathVariable String maTheLoai) {
        theLoaiService.deleteTheLoai(maTheLoai);
        return "Thể loại với mã " + maTheLoai + " đã được xóa thành công";
    }
}