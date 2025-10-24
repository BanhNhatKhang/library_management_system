package com.example.webapp.models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import java.util.HashSet;
import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

@Entity
@Table(name = "SACH")
public class Sach {

    @Id
    @NotNull
    @Column(name = "MASACH", length = 30, nullable = false)
    private String maSach;

    @NotNull
    @Column(name = "TENSACH", length = 100, nullable = false)
    private String tenSach;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "DONGIA", nullable = false)
    private BigDecimal donGia;

    @NotNull
    @Column(name = "SOQUYEN", nullable = false)
    private int soQuyen;

    @NotNull
    @Min(0)
    @Column(name = "SOLUONG", nullable = false)
    private int soLuong;

    @NotNull
    @Column(name = "NAMXUATBAN", nullable = false)
    private LocalDate namXuatBan;

    @NotNull
    @Column(name = "TACGIA", length = 25, nullable = false)
    private String tacGia;

    @Column(name = "MOTA", columnDefinition = "TEXT")
    private String moTa;

    @NotNull
    @Column(name = "ANHBIA", length = 255, nullable = false)
    private String anhBia;

    @Column(name = "DIEMDANHGIA")
    private Double diemDanhGia;

    @Column(name = "GIAMGIA")
    private Double giamGia;

    @ManyToOne
    @JoinColumn(name = "MANXB", referencedColumnName = "MANXB")
    private NhaXuatBan nhaXuatBan;

    @ManyToMany
    @JoinTable(
        name = "SACH_THELOAI",
        joinColumns = @JoinColumn(name = "MASACH"),
        inverseJoinColumns = @JoinColumn(name = "MATHELOAI")
    )
    private Set<TheLoai> theLoais = new HashSet<>();

    @ManyToMany(mappedBy = "sachs")
    @JsonIgnore
    private Set<UuDai> uuDais = new HashSet<>();

    public Sach() {}

    public Sach(String maSach, String tenSach, BigDecimal donGia, int soQuyen, int soLuong, LocalDate namXuatBan, String tacGia, String moTa, String anhBia, Double diemDanhGia, Double giamGia) {
        this.maSach = maSach;
        this.tenSach = tenSach;
        this.donGia = donGia;
        this.soQuyen = soQuyen;
        this.soLuong = soLuong;
        this.namXuatBan = namXuatBan;
        this.tacGia = tacGia;
        this.moTa = moTa;
        this.anhBia = anhBia;
        this.diemDanhGia = diemDanhGia;
        this.giamGia = giamGia;
    }

    // Getters và Setters cho Sach

    public String getMaSach() { return maSach; }
    public void setMaSach(String maSach) { this.maSach = maSach; }

    public String getTenSach() { return tenSach; }
    public void setTenSach(String tenSach) { this.tenSach = tenSach; }

    public BigDecimal getDonGia() { return donGia; }
    public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }

    public int getSoQuyen() { return soQuyen; }
    public void setSoQuyen(int soQuyen) { this.soQuyen = soQuyen; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }

    public LocalDate getNamXuatBan() { return namXuatBan; }
    public void setNamXuatBan(LocalDate namXuatBan) { this.namXuatBan = namXuatBan; }

    public String getTacGia() { return tacGia; }
    public void setTacGia(String tacGia) { this.tacGia = tacGia; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public String getAnhBia() { return anhBia; }
    public void setAnhBia(String anhBia) { this.anhBia = anhBia; }

    public Double getDiemDanhGia() { return diemDanhGia; }
    public void setDiemDanhGia(Double diemDanhGia) { this.diemDanhGia = diemDanhGia; }

    public Double getGiamGia() { return giamGia; }
    public void setGiamGia(Double giamGia) { this.giamGia = giamGia; }   

    public Set<TheLoai> getTheLoais() { return theLoais; }
    public void setTheLoais(Set<TheLoai> theLoais) { this.theLoais = theLoais; }

    public NhaXuatBan getNhaXuatBan() { return nhaXuatBan; }
    public void setNhaXuatBan(NhaXuatBan nhaXuatBan) { this.nhaXuatBan = nhaXuatBan; }

    public Set<UuDai> getUuDais() { return uuDais; }
    public void setUuDais(Set<UuDai> uuDais) { this.uuDais = uuDais; }

}