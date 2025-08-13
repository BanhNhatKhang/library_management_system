package com.example.webapp.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;


@Embeddable
public class GioHangId implements Serializable {

    @NotNull
    @Column(name = "MADOCGIA", length = 30, nullable = false)
    private String maDocGia;

    @NotNull
    @Column(name = "MASACH", length = 30, nullable = false)
    private String maSach;

    public GioHangId() {}

    public GioHangId(String maDocGia, String maSach) {
        this.maDocGia = maDocGia;
        this.maSach = maSach;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GioHangId that = (GioHangId) o;
        return Objects.equals(maDocGia, that.maDocGia) && Objects.equals(maSach, that.maSach);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maDocGia, maSach);
    }
} 