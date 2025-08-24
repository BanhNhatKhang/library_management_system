package com.example.webapp.dto;

import java.time.LocalDate;

public class GioHangDTO {
    private String maDocGia;
    private String maSach;
    private LocalDate ngayThem;
    private int soLuong;

    // Getters và Setters
    public String getMaDocGia() { return maDocGia; }
    public void setMaDocGia(String maDocGia) { this.maDocGia = maDocGia; }

    public String getMaSach() { return maSach; }
    public void setMaSach(String maSach) { this.maSach = maSach; }

    public LocalDate getNgayThem() { return ngayThem; }
    public void setNgayThem(LocalDate ngayThem) { this.ngayThem = ngayThem; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }
}