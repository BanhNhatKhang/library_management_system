package com.example.webapp.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ChiTietDonHangId implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    @Column(name = "MADONHANG", length = 30, nullable = false)
    private String maDonHang;

    @NotNull
    @Column(name = "MASACH", length = 30, nullable = false)
    private String maSach;

    public ChiTietDonHangId() {}

    public ChiTietDonHangId(String maDonHang, String maSach) {
        this.maDonHang = maDonHang;
        this.maSach = maSach;
    }

    // Getters và Setters cho ChiTietDonHangId

    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }

    public String getMaSach() { return maSach; }
    public void setMaSach(String maSach) { this.maSach = maSach; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChiTietDonHangId that = (ChiTietDonHangId) o;
        return Objects.equals(maDonHang, that.maDonHang) && Objects.equals(maSach, that.maSach);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maDonHang, maSach);
    }

    @Override
    public String toString() {
        return "ChiTietDonHangId{" +
                "maDonHang='" + maDonHang + '\'' +
                ", maSach='" + maSach + '\'' +
                '}';
    }

}