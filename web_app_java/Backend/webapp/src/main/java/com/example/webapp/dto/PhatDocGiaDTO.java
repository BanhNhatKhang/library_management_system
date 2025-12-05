package com.example.webapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PhatDocGiaDTO {
    private Long maPhat;
    private String maDocGia;
    private String maSach;
    private String tenSach;
    private String tenDocGia;
    private BigDecimal soTienPhat;
    private int soNgayQuaHan;
    private LocalDateTime ngayTaoPhat;
    private String trangThaiPhat;
    private LocalDateTime ngayThanhToan;
    private String ghiChu;

    // Constructors
    public PhatDocGiaDTO() {}

    // Getters and Setters
    public Long getMaPhat() { return maPhat; }
    public void setMaPhat(Long maPhat) { this.maPhat = maPhat; }

    public String getMaDocGia() { return maDocGia; }
    public void setMaDocGia(String maDocGia) { this.maDocGia = maDocGia; }

    public String getMaSach() { return maSach; }
    public void setMaSach(String maSach) { this.maSach = maSach; }

    public String getTenSach() { return tenSach; }
    public void setTenSach(String tenSach) { this.tenSach = tenSach; }

    public String getTenDocGia() { return tenDocGia; }
    public void setTenDocGia(String tenDocGia) { this.tenDocGia = tenDocGia; }

    public BigDecimal getSoTienPhat() { return soTienPhat; }
    public void setSoTienPhat(BigDecimal soTienPhat) { this.soTienPhat = soTienPhat; }

    public int getSoNgayQuaHan() { return soNgayQuaHan; }
    public void setSoNgayQuaHan(int soNgayQuaHan) { this.soNgayQuaHan = soNgayQuaHan; }

    public LocalDateTime getNgayTaoPhat() { return ngayTaoPhat; }
    public void setNgayTaoPhat(LocalDateTime ngayTaoPhat) { this.ngayTaoPhat = ngayTaoPhat; }

    public String getTrangThaiPhat() { return trangThaiPhat; }
    public void setTrangThaiPhat(String trangThaiPhat) { this.trangThaiPhat = trangThaiPhat; }

    public LocalDateTime getNgayThanhToan() { return ngayThanhToan; }
    public void setNgayThanhToan(LocalDateTime ngayThanhToan) { this.ngayThanhToan = ngayThanhToan; }

    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
}