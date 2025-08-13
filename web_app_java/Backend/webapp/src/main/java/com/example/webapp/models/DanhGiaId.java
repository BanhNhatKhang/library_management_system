package com.example.webapp.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;
import java.time.LocalDate;

@Embeddable
public class DanhGiaId implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    @Column(name = "MADOCGIA", length = 30, nullable = false)
    private String maDocGia;

    @NotNull
    @Column(name = "MASACH", length = 30, nullable = false)
    private String maSach;


    @NotNull
    @Column(name = "NGAYDANHGIA", nullable = false)
    private LocalDate ngayDanhGia;

    public DanhGiaId() {}
    public DanhGiaId(String maDocGia, String maSach, LocalDate ngayDanhGia) {
        this.ngayDanhGia = ngayDanhGia;
        this.maDocGia = maDocGia;
        this.maSach = maSach;
    }

   @Override
   public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DanhGiaId that = (DanhGiaId) o;
        return Objects.equals(maDocGia, that.maDocGia) &&
               Objects.equals(maSach, that.maSach) &&
               Objects.equals(ngayDanhGia, that.ngayDanhGia);
   }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(maDocGia,maSach,ngayDanhGia);
    }

}