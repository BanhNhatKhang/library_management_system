package com.example.webapp.dto;

import java.math.BigDecimal;

public class ChiTietDonHangDTO {

    private String maDonHang;
    private String maSach;
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal tongTien;   
    private Long tongSoLuong;     

    public ChiTietDonHangDTO() {}

    
    public ChiTietDonHangDTO(String maDonHang, String maSach, Integer soLuong, BigDecimal donGia) {
        this.maDonHang = maDonHang;
        this.maSach = maSach;
        this.soLuong = soLuong;
        this.donGia = donGia;
    }

    
    public ChiTietDonHangDTO(String maDonHang, BigDecimal tongTien) {
        this.maDonHang = maDonHang;
        this.tongTien = tongTien;
    }

    
    public ChiTietDonHangDTO(String maSach, Long tongSoLuong) {
        this.maSach = maSach;
        this.tongSoLuong = tongSoLuong;
    }

    
    public String getMaDonHang() {
        return maDonHang;
    }

    public void setMaDonHang(String maDonHang) {
        this.maDonHang = maDonHang;
    }

    public String getMaSach() {
        return maSach;
    }

    public void setMaSach(String maSach) {
        this.maSach = maSach;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
    }

    public BigDecimal getTongTien() {
        return tongTien;
    }

    public void setTongTien(BigDecimal tongTien) {
        this.tongTien = tongTien;
    }

    public Long getTongSoLuong() {
        return tongSoLuong;
    }

    public void setTongSoLuong(Long tongSoLuong) {
        this.tongSoLuong = tongSoLuong;
    }
}
