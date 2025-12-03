package com.example.webapp.dto;

import java.math.BigDecimal;

public class ChiTietDonHangDTO {
    private String maDonHang;
    private String maSach;
    private String tenSach;
    private String tacGia;
    private String anhBia;
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal thanhTien; // soLuong * donGia

    // Constructors
    public ChiTietDonHangDTO() {}

    public ChiTietDonHangDTO(String maDonHang, String maSach, String tenSach, 
                            String tacGia, String anhBia, Integer soLuong, 
                            BigDecimal donGia) {
        this.maDonHang = maDonHang;
        this.maSach = maSach;
        this.tenSach = tenSach;
        this.tacGia = tacGia;
        this.anhBia = anhBia;
        this.soLuong = soLuong;
        this.donGia = donGia;
        this.thanhTien = donGia.multiply(BigDecimal.valueOf(soLuong));
    }

    // Getters and Setters
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

    public String getTenSach() {
        return tenSach;
    }

    public void setTenSach(String tenSach) {
        this.tenSach = tenSach;
    }

    public String getTacGia() {
        return tacGia;
    }

    public void setTacGia(String tacGia) {
        this.tacGia = tacGia;
    }

    public String getAnhBia() {
        return anhBia;
    }

    public void setAnhBia(String anhBia) {
        this.anhBia = anhBia;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
        // Tự động tính lại thành tiền khi số lượng thay đổi
        if (this.donGia != null) {
            this.thanhTien = this.donGia.multiply(BigDecimal.valueOf(soLuong));
        }
    }

    public BigDecimal getDonGia() {
        return donGia;
    }

    public void setDonGia(BigDecimal donGia) {
        this.donGia = donGia;
        // Tự động tính lại thành tiền khi giá thay đổi
        if (this.soLuong != null) {
            this.thanhTien = donGia.multiply(BigDecimal.valueOf(this.soLuong));
        }
    }

    public BigDecimal getThanhTien() {
        return thanhTien;
    }

    public void setThanhTien(BigDecimal thanhTien) {
        this.thanhTien = thanhTien;
    }
}
