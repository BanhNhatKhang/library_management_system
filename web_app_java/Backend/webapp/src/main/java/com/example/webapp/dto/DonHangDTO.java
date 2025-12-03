package com.example.webapp.dto;

import com.example.webapp.models.DonHang;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DonHangDTO {
    private String maDonHang;
    private LocalDate ngayDat;
    private BigDecimal tongTien;
    private String maDocGia;
    
    @JsonIgnore // Ẩn field enum khỏi JSON
    private DonHang.TrangThaiDonHang trangThai;

    // Getters và setters cho các field khác
    public String getMaDonHang() {return maDonHang;}
    public void setMaDonHang(String maDonHang) {this.maDonHang = maDonHang;}

    public LocalDate getNgayDat() {return ngayDat;}
    public void setNgayDat(LocalDate ngayDat) {this.ngayDat = ngayDat;}

    public BigDecimal getTongTien() {return tongTien;}
    public void setTongTien(BigDecimal tongTien) {this.tongTien = tongTien;}

    public String getMaDocGia() {return maDocGia;}
    public void setMaDocGia(String maDocGia) {this.maDocGia = maDocGia;}

    // Getter/setter cho enum (cho internal use)
    public DonHang.TrangThaiDonHang getTrangThaiEnum() {
        return trangThai;
    }
    
    public void setTrangThaiEnum(DonHang.TrangThaiDonHang trangThai) {
        this.trangThai = trangThai;
    }

    // Getter/setter cho JSON serialization (trả về string)
    @JsonProperty("trangThai") // Đảm bảo field name trong JSON
    public String getTrangThai() {
        return trangThai != null ? trangThai.name() : "DANGXULY";
    }

    @JsonProperty("trangThai")
    public void setTrangThai(String trangThaiStr) {
        try {
            this.trangThai = DonHang.TrangThaiDonHang.valueOf(trangThaiStr);
        } catch (IllegalArgumentException e) {
            this.trangThai = DonHang.TrangThaiDonHang.DANGXULY; // Default
        }
    }

    // Để backward compatibility với frontend cũ
    @JsonProperty("trangThaiDonHang")
    public String getTrangThaiDonHang() {
        return getTrangThai();
    }

    @JsonProperty("trangThaiDonHang") 
    public void setTrangThaiDonHang(String trangThaiStr) {
        setTrangThai(trangThaiStr);
    }
}