package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
import jakarta.validation.constraints.Min;

@Entity
@Table(name = "GIOHANG")
public class GioHang {

    @EmbeddedId
    private GioHangId id;

    @NotNull
    @Min(1)
    @Column(name = "SOLUONG")
    private int soLuong;

    @NotNull
    @Column(name = "NGAYTHEM", insertable = false, nullable = false)
    private LocalDate ngayThem;

    @ManyToOne(optional = false)
    @MapsId("maDocGia")
    @JoinColumn(name = "MADOCGIA", referencedColumnName = "MADOCGIA", nullable = false)
    private DocGia docGia;

    @ManyToOne(optional = false)
    @MapsId("maSach")
    @JoinColumn(name = "MASACH", referencedColumnName = "MASACH", nullable = false)
    private Sach sach;

    @PrePersist
    public void prePersist() {
        if (ngayThem == null) {
            ngayThem = LocalDate.now();
        }
    }

}  
