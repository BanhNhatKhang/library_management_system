package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

@Entity
@Table(name = "CHITIETDONHANG")
public class ChiTietDonHang {

    @EmbeddedId
    private ChiTietDonHangId id;

    @NotNull
    @Min(1)
    @Column(name = "SOLUONG", nullable = false)
    private int soLuong;

    @NotNull
    @DecimalMin(value = "0.00", inclusive = true)
    @Column(name = "DONGIA", nullable = false, precision = 10, scale = 2)
    private BigDecimal donGia;

    @ManyToOne(optional = false)
    @MapsId("maDonHang")
    @JoinColumn(name = "MADONHANG", referencedColumnName = "MADONHANG", nullable = false)
    private DonHang donHang;

    @ManyToOne(optional = false)
    @MapsId("maSach")
    @JoinColumn(name = "MASACH", referencedColumnName = "MASACH", nullable = false)
    private Sach sach;

    public ChiTietDonHang() {}

    public ChiTietDonHang(ChiTietDonHangId id, int soLuong, BigDecimal donGia, DonHang donHang, Sach sach) {
        this.id = id;
        this.soLuong = soLuong;
        this.donGia = donGia;
        this.donHang = donHang;
        this.sach = sach;
    }

    // Getters và Setters cho ChiTietDonHang

    public ChiTietDonHangId getId() { return id; }
    public void setId(ChiTietDonHangId id) { this.id = id; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }

    public BigDecimal getDonGia() { return donGia; }
    public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }

    public DonHang getDonHang() { return donHang; }
    public void setDonHang(DonHang donHang) { this.donHang = donHang; }

    public Sach getSach() { return sach; }
    public void setSach(Sach sach) { this.sach = sach; }

}