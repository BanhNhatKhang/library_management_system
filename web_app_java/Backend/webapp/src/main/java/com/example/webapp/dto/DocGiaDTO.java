package com.example.webapp.dto;

import java.time.LocalDate;

public class DocGiaDTO {
    private String maDocGia;
    private String hoLot;
    private String ten;
    private String email;
    private String gioiTinh; // SỬA: Đổi từ enum sang String
    private String diaChi;
    private String dienThoai;
    private LocalDate ngaySinh;
    private String vaiTro;
    private String trangThai;

    // Constructors
    public DocGiaDTO() {}

    // Getters and Setters
    public String getMaDocGia() { return maDocGia; }
    public void setMaDocGia(String maDocGia) { this.maDocGia = maDocGia; }

    public String getHoLot() { return hoLot; }
    public void setHoLot(String hoLot) { this.hoLot = hoLot; }

    public String getTen() { return ten; }
    public void setTen(String ten) { this.ten = ten; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getGioiTinh() { return gioiTinh; }
    public void setGioiTinh(String gioiTinh) { this.gioiTinh = gioiTinh; }

    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }

    public String getDienThoai() { return dienThoai; }
    public void setDienThoai(String dienThoai) { this.dienThoai = dienThoai; }

    public LocalDate getNgaySinh() { return ngaySinh; }
    public void setNgaySinh(LocalDate ngaySinh) { this.ngaySinh = ngaySinh; }

    public String getVaiTro() { return vaiTro; }
    public void setVaiTro(String vaiTro) { this.vaiTro = vaiTro; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}