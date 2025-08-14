package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "NHAXUATBAN")
public class NhaXuatBan {

    @Id
    @Column(name = "MANXB", length = 30, nullable = false)
    private String maNhaXuatBan;

    @NotNull
    @Column(name = "TENNXB", length = 25, nullable = false)
    private String tenNhaXuatBan;

    @Column(name = "DIACHI", columnDefinition = "TEXT")
    private String diaChi;

    public NhaXuatBan() {}

    public NhaXuatBan(String maNhaXuatBan, String tenNhaXuatBan, String diaChi) {
        this.maNhaXuatBan = maNhaXuatBan;
        this.tenNhaXuatBan = tenNhaXuatBan;
        this.diaChi = diaChi;
    }

    // Getters và Setters cho NhaXuatBan

    public String getMaNhaXuatBan() { return maNhaXuatBan; }
    public void setMaNhaXuatBan(String maNhaXuatBan) { this.maNhaXuatBan = maNhaXuatBan; }

    public String getTenNhaXuatBan() { return tenNhaXuatBan; }
    public void setTenNhaXuatBan(String tenNhaXuatBan) { this.tenNhaXuatBan = tenNhaXuatBan; }

    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }

}

    