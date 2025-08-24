package com.example.webapp.dto;

import java.time.LocalDate;

public class TheoDoiMuonSachDTO {
    private String maDocGia;
    private String maSach;
    private LocalDate ngayMuon;
    private LocalDate ngayTra;
    private String trangThaiMuon;
    private String maNhanVien;

    // Getters và Setters
    public String getMaDocGia() { return maDocGia; }
    public void setMaDocGia(String maDocGia) { this.maDocGia = maDocGia; }

    public String getMaSach() { return maSach; }
    public void setMaSach(String maSach) { this.maSach = maSach; }

    public LocalDate getNgayMuon() { return ngayMuon; }
    public void setNgayMuon(LocalDate ngayMuon) { this.ngayMuon = ngayMuon; }

    public LocalDate getNgayTra() { return ngayTra; }
    public void setNgayTra(LocalDate ngayTra) { this.ngayTra = ngayTra; }

    public String getTrangThaiMuon() { return trangThaiMuon; }
    public void setTrangThaiMuon(String trangThaiMuon) { this.trangThaiMuon = trangThaiMuon; }

    public String getMaNhanVien() { return maNhanVien; }
    public void setMaNhanVien(String maNhanVien) { this.maNhanVien = maNhanVien; }
}