package com.example.webapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class SachDTO {
    private String maSach;
    private String tenSach;
    private int soQuyen;
    private BigDecimal donGia;
    private int soLuong;
    private LocalDate namXuatBan;
    private String tacGia;
    private String moTa;
    private String anhBia;
    private Double diemDanhGia;
    private Double giamGia;
    private String nhaXuatBan;
    private List<String> theLoais;

    public String getMaSach() {return maSach;}
    public void setMaSach(String maSach) {this.maSach = maSach;}

    public String getTenSach() {return tenSach;}
    public void setTenSach(String tenSach) {this.tenSach = tenSach;}

    public int getSoQuyen() {return soQuyen;}
    public void setSoQuyen(int soQuyen) {this.soQuyen = soQuyen;}

    public BigDecimal getDonGia() {return donGia;}
    public void setDonGia(BigDecimal donGia) {this.donGia = donGia;}

    public int getSoLuong() {return soLuong;}
    public void setSoLuong(int soLuong) {this.soLuong = soLuong;}

    public LocalDate getNamXuatBan() {return namXuatBan;}
    public void setNamXuatBan(LocalDate namXuatBan) {this.namXuatBan = namXuatBan;}

    public String getTacGia() {return tacGia;}
    public void setTacGia(String tacGia) {this.tacGia = tacGia;}

    public String getMoTa() {return moTa;}
    public void setMoTa(String moTa) {this.moTa = moTa;}

    public String getAnhBia() {return anhBia;}
    public void setAnhBia(String anhBia) {this.anhBia = anhBia;}

    public Double getDiemDanhGia() {return diemDanhGia;}
    public void setDiemDanhGia(Double diemDanhGia) {this.diemDanhGia = diemDanhGia;}      

    public Double getGiamGia() {return giamGia;}
    public void setGiamGia(Double giamGia) {this.giamGia = giamGia;}   

    public String getNhaXuatBan() {return nhaXuatBan;}
    public void setNhaXuatBan(String nhaXuatBan) { this.nhaXuatBan = nhaXuatBan; }

    public List<String> getTheLoais() {return theLoais;}
    public void setTheLoais(List<String> theLoais) {
        this.theLoais = theLoais;
    }
}