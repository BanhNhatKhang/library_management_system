package com.example.webapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DonHangUpdateDTO {
    private String maDonHang;
    private String maDocGia;
    private LocalDate ngayDat;
    private BigDecimal tongTien;
    private String trangThai;

    // Constructors, getters, setters
    public DonHangUpdateDTO() {}

    public DonHangUpdateDTO(String maDonHang, String maDocGia, LocalDate ngayDat, BigDecimal tongTien, String trangThai) {
        this.maDonHang = maDonHang;
        this.maDocGia = maDocGia;
        this.ngayDat = ngayDat;
        this.tongTien = tongTien;
        this.trangThai = trangThai;
    }

    // Getters and setters
    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }

    public String getMaDocGia() { return maDocGia; }
    public void setMaDocGia(String maDocGia) { this.maDocGia = maDocGia; }

    public LocalDate getNgayDat() { return ngayDat; }
    public void setNgayDat(LocalDate ngayDat) { this.ngayDat = ngayDat; }

    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}