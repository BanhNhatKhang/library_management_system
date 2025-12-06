package com.example.webapp.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "DONHANG")
public class DonHang {

    @Id
    @Column(name = "MADONHANG", length = 30, nullable = false)
    private String maDonHang;

    @NotNull
    @Column(name = "NGAYDAT", nullable = false)
    private LocalDate ngayDat;

    @NotNull
    @Column(name = "TONGTIEN", nullable = false, precision = 10, scale = 2)
    private BigDecimal tongTien;

    public enum TrangThaiDonHang {
        DANGXULY,
        DAGIAO,
        DAHUY,
        GIAOTHATBAI
    }
    @Enumerated(EnumType.STRING)
    @Column(name = "TRANGTHAI", nullable = false)
    private TrangThaiDonHang trangThai;

    @ManyToOne(optional = false)
    @JoinColumn(name = "MADOCGIA", referencedColumnName = "MADOCGIA", nullable = false)
    private DocGia docGia;

    @ManyToMany
    @JoinTable(
        name = "DONHANG_UUDAI",
        joinColumns = @JoinColumn(name = "MADONHANG"),
        inverseJoinColumns = @JoinColumn(name = "MAUUDAI")
    )
    private Set<UuDai> uuDais = new HashSet<>();

    public DonHang() {}

    public DonHang(String maDonHang, LocalDate ngayDat, BigDecimal tongTien, TrangThaiDonHang trangThai) {
        this.maDonHang = maDonHang;
        this.ngayDat = ngayDat;
        this.tongTien = tongTien;
        this.trangThai = trangThai;
    }

    // Getters và Setters cho DonHang

    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }

    public LocalDate getNgayDat() { return ngayDat; }
    public void setNgayDat(LocalDate ngayDat) { this.ngayDat = ngayDat; }

    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }

    public TrangThaiDonHang getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiDonHang trangThai) { this.trangThai = trangThai; }

    public DocGia getDocGia() { return docGia; }
    public void setDocGia(DocGia docGia) { this.docGia = docGia; }

    public Set<UuDai> getUuDais() { return uuDais; }
    public void setUuDais(Set<UuDai> uuDais) { this.uuDais = uuDais; }

}