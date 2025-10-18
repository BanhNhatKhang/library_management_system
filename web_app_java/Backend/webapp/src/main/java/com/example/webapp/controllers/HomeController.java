package com.example.webapp.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.webapp.services.TheLoaiService;
import com.example.webapp.services.ThongBaoMuonSachService;
import com.example.webapp.services.SachService;
import com.example.webapp.dto.TheLoaiDTO;
import com.example.webapp.dto.ThongBaoMuonSachDTO;
import com.example.webapp.dto.HomeDTO;
import com.example.webapp.dto.SachDTO;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/home")
public class HomeController {

    @Autowired
    private TheLoaiService theLoaiService;

    @Autowired
    private SachService sachService;
    
    @Autowired
    private ThongBaoMuonSachService thongBaoMuonSachService;

    @GetMapping("/sach-theo-theloai")
    public List<HomeDTO> getBooksByCategory() {
        List<TheLoaiDTO> theLoais = theLoaiService.getAllTheLoai();
        System.out.println("==> TheLoai count: " + theLoais.size());
        for (TheLoaiDTO tl : theLoais) {
            System.out.println("   - " + tl.getTenTheLoai());
        }

        return theLoais.stream().map(tl -> {
            HomeDTO homeDTO = new HomeDTO();
            homeDTO.setMaTheLoai(tl.getMaTheLoai());
            homeDTO.setTenTheLoai(tl.getTenTheLoai());
            homeDTO.setSachList(sachService.getSachByTheLoai(tl.getTenTheLoai()));
            return homeDTO;
        }).collect(Collectors.toList());
    }

    @GetMapping("/theloai")
    public List<TheLoaiDTO> getAllTheLoaiDTOs() {
        return theLoaiService.getAllTheLoai();
    }

    @GetMapping("/sach-uu-dai")
    public List<SachDTO> getFlashSaleBooks() {
        return sachService.getSachUuDai();
    }

    @GetMapping("/sach/all")
    public List<SachDTO> getAllSach() {
        return sachService.getAllSach();
    }

    @GetMapping("/thongbao")
    public List<ThongBaoMuonSachDTO> getThongBao() {
        return thongBaoMuonSachService.getAll()
                              .stream()
                              .map(tb -> {
                                  ThongBaoMuonSachDTO dto = new ThongBaoMuonSachDTO();
                                  dto.setNoiDung(tb.getNoiDung());
                                  dto.setThoiGianGui(tb.getThoiGianGui());
                                  dto.setLoaiThongBao(tb.getLoaiThongBao());
                                  return dto;
                              })
                              .collect(Collectors.toList());
    }

}