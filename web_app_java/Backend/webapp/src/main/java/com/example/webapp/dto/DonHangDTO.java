package com.example.webapp.dto;

import com.example.webapp.models.DonHang;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DonHangDTO {
    private String maDonHang;
    private LocalDate ngayDat;
    private BigDecimal tongTien;
    private String maDocGia;
    private DonHang.TrangThaiDonHang trangThai;

    public String getMaDonHang() {return maDonHang;}
    public void setMaDonHang(String maDonHang) {this.maDonHang = maDonHang;}

    public LocalDate getNgayDat() {return ngayDat;}
    public void setNgayDat(LocalDate ngayDat) {this.ngayDat = ngayDat;}

    public BigDecimal getTongTien() {return tongTien;}
    public void setTongTien(BigDecimal tongTien) {this.tongTien = tongTien;}

    public String getMaDocGia() {return maDocGia;}
    public void setMaDocGia(String maDocGia) {this.maDocGia = maDocGia;}

    public DonHang.TrangThaiDonHang getTrangThaiDonHang() {return trangThai;}
    public void setTrangThaiDonHang(DonHang.TrangThaiDonHang trangThai) {this.trangThai = trangThai;}

}