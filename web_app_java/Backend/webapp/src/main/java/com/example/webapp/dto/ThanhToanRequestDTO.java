package com.example.webapp.dto;

import java.math.BigDecimal;
import java.util.List;

public class ThanhToanRequestDTO {
    private String maDocGia;
    private List<String> maSachList;
    private BigDecimal tongTien;
    private String maUuDai; // Thêm field này

    // Constructors
    public ThanhToanRequestDTO() {}
    
    public ThanhToanRequestDTO(String maDocGia, List<String> maSachList, BigDecimal tongTien) {
        this.maDocGia = maDocGia;
        this.maSachList = maSachList;
        this.tongTien = tongTien;
    }
    
    // Getters and Setters
    public String getMaDocGia() { return maDocGia; }
    public void setMaDocGia(String maDocGia) { this.maDocGia = maDocGia; }

    public List<String> getMaSachList() { return maSachList; }
    public void setMaSachList(List<String> maSachList) { this.maSachList = maSachList; }

    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }

    public String getMaUuDai() { return maUuDai; }
    public void setMaUuDai(String maUuDai) { this.maUuDai = maUuDai; }
}