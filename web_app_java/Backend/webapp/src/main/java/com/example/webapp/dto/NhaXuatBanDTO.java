package com.example.webapp.dto;

public class NhaXuatBanDTO {
    private String maNhaXuatBan;
    private String tenNhaXuatBan;
    private String diaChi;

    public enum TrangThaiNXB { MOKHOA, DAKHOA }
    private TrangThaiNXB trangThai;

    public String getMaNhaXuatBan() { return maNhaXuatBan; }
    public void setMaNhaXuatBan(String maNhaXuatBan) { this.maNhaXuatBan = maNhaXuatBan; }

    public String getTenNhaXuatBan() { return tenNhaXuatBan; }
    public void setTenNhaXuatBan(String tenNhaXuatBan) { this.tenNhaXuatBan = tenNhaXuatBan; }

    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }

    public TrangThaiNXB getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiNXB trangThai) { this.trangThai = trangThai; }
}