package com.example.webapp.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.time.LocalDate;

@Embeddable
public class TheoDoiMuonSachId implements Serializable {

    @Column(name = "MADOCGIA", length = 30, nullable = false)
    private String maDocGia;

    @Column(name = "MASACH", length = 30, nullable = false)
    private String maSach;

    @Column(name = "NGAYMUON", nullable = false)
    private LocalDate ngayMuon;

    public TheoDoiMuonSachId() {}

    public TheoDoiMuonSachId(String maDocGia, String maSach, LocalDate ngayMuon) {
        this.maDocGia = maDocGia;
        this.maSach = maSach;
        this.ngayMuon = ngayMuon;
    }

    // Getters và Setters cho TheoDoiMuonSachId

    public String getMaDocGia() {return maDocGia;}
    public void setMaDocGia(String maDocGia) {this.maDocGia = maDocGia;}

    public String getMaSach() {return maSach;}
    public void setMaSach(String maSach) {this.maSach = maSach;}

    public LocalDate getNgayMuon() {return ngayMuon;}
    public void setNgayMuon(LocalDate ngayMuon) {this.ngayMuon = ngayMuon;}

    // Override equals và hashCode để so sánh các trường hợp của TheoDoiMuonSachId

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TheoDoiMuonSachId that = (TheoDoiMuonSachId) o;
        return maDocGia.equals(that.maDocGia) &&
               maSach.equals(that.maSach) &&
               ngayMuon.equals(that.ngayMuon);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maDocGia, maSach, ngayMuon);
    }
}