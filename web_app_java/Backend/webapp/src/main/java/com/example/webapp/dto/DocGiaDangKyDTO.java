package com.example.webapp.dto;

import java.time.LocalDate;

public class DocGiaDangKyDTO {

    private String maDocGia;
    private String hoLot;
    private String ten;
    private String vaiTro;
    private String gioiTinh;
    private String diaChi;
    private LocalDate ngaySinh;
    private String dienThoai;
    private String email;
    private String matKhau;

    // Getters and Setters

    public String getMaDocGia() {return maDocGia;}
    public void setMaDocGia(String maDocGia) {this.maDocGia = maDocGia;}

    public String getHoLot() {return hoLot;}
    public void setHoLot(String hoLot) {this.hoLot = hoLot;}

    public String getTen() {return ten;}
    public void setTen(String ten) {this.ten = ten;}

    public String getVaiTro() {return vaiTro;}
    public void setVaiTro(String vaiTro) {this.vaiTro = vaiTro;}

    public String getGioiTinh() {return gioiTinh;}
    public void setGioiTinh(String gioiTinh) {this.gioiTinh = gioiTinh;}

    public String getDiaChi() {return diaChi;}
    public void setDiaChi(String diaChi) {this.diaChi = diaChi;}

    public LocalDate getNgaySinh() {return ngaySinh;}
    public void setNgaySinh(LocalDate ngaySinh) {this.ngaySinh = ngaySinh;}

    public String getDienThoai() { return dienThoai;}
    public void setDienThoai(String dienThoai) { this.dienThoai = dienThoai;}

    public String getEmail() {return email;}
    public void setEmail(String email) {this.email = email;}

    public String getMatKhau() {return matKhau;}
    public void setMatKhau(String matKhau) {this.matKhau = matKhau;
    }
}