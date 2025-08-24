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

    @PostMapping
    public TheLoaiDTO createTheLoai(@RequestBody TheLoaiDTO theLoaiDTO) {
        return theLoaiService.saveTheLoai(theLoaiDTO);
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