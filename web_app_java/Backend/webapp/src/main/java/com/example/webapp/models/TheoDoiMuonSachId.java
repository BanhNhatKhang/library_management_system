package com.example.webapp.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;
import java.time.LocalDate;

@Embeddable
public class TheoDoiMuonSachId implements java.io.Serializable {

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
        return java.util.Objects.hash(maDocGia, maSach, ngayMuon);
    }
}