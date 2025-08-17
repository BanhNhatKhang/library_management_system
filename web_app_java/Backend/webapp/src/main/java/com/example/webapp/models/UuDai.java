package com.example.webapp.models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

import java.util.Set;
import java.util.HashSet;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "UUDAI")
public class UuDai {

    @Id
    @Column(name ="MAUUDAI", length = 30, nullable = false)
    private String maUuDai;

    @NotNull
    @Column(name = "TENUUDAI", nullable = false, columnDefinition = "TEXT")
    private String tenUuDai;

    @NotNull
    @Column(name = "MOTA", nullable = false, columnDefinition = "TEXT")
    private String moTa;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Column(name = "PHANTRAMGIAM", nullable = false, precision = 10, scale = 2)
    private BigDecimal phanTramGiam;

    @NotNull
    @Column(name = "NGAYBATDAU", nullable = false)
    private LocalDate ngayBatDau;
    
    @NotNull
    @Column(name = "NGAYKETTHUC", nullable = false)
    private LocalDate ngayKetThuc;

    @AssertTrue(message = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu")
    @Transient
    public boolean isNgayKetThuHopLe() {
        return ngayKetThuc == null || ngayBatDau == null || !ngayKetThuc.isBefore(ngayBatDau);
    }

    @ManyToMany(mappedBy = "uuDais")
    @JsonIgnore
    private Set<DonHang> donHangs = new HashSet<>();

    public UuDai() {}

    public UuDai(String maUuDai, String tenUuDai, String moTa, BigDecimal phanTramGiam, LocalDate ngayBatDau, LocalDate ngayKetThuc) {
        this.maUuDai = maUuDai;
        this.tenUuDai = tenUuDai;
        this.moTa = moTa;
        this.phanTramGiam = phanTramGiam;
        this.ngayBatDau = ngayBatDau;
        this.ngayKetThuc = ngayKetThuc;
    }

    // Getters và Setters UuDai

    public String getMaUuDai() { return maUuDai; }
    public void setMaUuDai(String maUuDai) { this.maUuDai = maUuDai; }

    public String getTenUuDai() { return tenUuDai; }
    public void setTenUuDai(String tenUuDai) { this.tenUuDai = tenUuDai; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public BigDecimal getPhanTramGiam() { return phanTramGiam; }
    public void setPhanTramGiam(BigDecimal phanTramGiam) { this.phanTramGiam = phanTramGiam; }

    public LocalDate getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public LocalDate getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }

    public Set<DonHang> getDonHangs() { return donHangs; }
    public void setDonHangs(Set<DonHang> donHangs) { this.donHangs = donHangs; }

}