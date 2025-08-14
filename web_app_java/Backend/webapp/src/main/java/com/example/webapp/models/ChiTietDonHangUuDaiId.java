package com.example.webapp.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;


@Embeddable
public class ChiTietDonHangUuDaiId implements Serializable {

    @NotNull
    @Column(name = "MADONHANG", length = 30, nullable = false)
    private String maDonHang;

    @NotNull
    @Column(name = "MASACH", length = 30, nullable = false)
    private String maSach;

    @NotNull
    @Column(name = "MAUUDAI", length = 30, nullable = false)
    private String maUuDai;

    public ChiTietDonHangUuDaiId() {}

    public ChiTietDonHangUuDaiId(String maDonHang, String maSach, String maUuDai) {
        this.maDonHang = maDonHang;
        this.maSach = maSach;
        this.maUuDai = maUuDai;
    }

    // Getters và Setters cho ChiTietDonHangUuDaiId

    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }

    public String getMaSach() { return maSach; }
    public void setMaSach(String maSach) { this.maSach = maSach; }

    public String getMaUuDai() { return maUuDai; }
    public void setMaUuDai(String maUuDai) { this.maUuDai = maUuDai; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChiTietDonHangUuDaiId that = (ChiTietDonHangUuDaiId) o;
        return Objects.equals(maDonHang, that.maDonHang) &&
               Objects.equals(maSach, that.maSach) &&
               Objects.equals(maUuDai, that.maUuDai);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maDonHang, maSach, maUuDai);
    }
}
