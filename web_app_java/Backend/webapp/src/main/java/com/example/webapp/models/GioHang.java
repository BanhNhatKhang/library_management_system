package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
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
    @Column(name = "NGAYTHEM", nullable = false)
    private LocalDate ngayThem;

    @ManyToOne(optional = false)
    @MapsId("maDocGia")
    @JoinColumn(name = "MADOCGIA", referencedColumnName = "MADOCGIA", nullable = false)
    private DocGia docGia;

    @ManyToOne(optional = false)
    @MapsId("maSach")
    @JoinColumn(name = "MASACH", referencedColumnName = "MASACH", nullable = false)
    private Sach sach;

    public GioHang() {}

    public GioHang(GioHangId id, int soLuong, LocalDate ngayThem) {
        this.id = id;
        this.soLuong = soLuong;
        this.ngayThem = ngayThem;
    }

    @PrePersist
    public void prePersist() {
        if (ngayThem == null) {
            ngayThem = LocalDate.now();
        }
    }

    // Getters và Setters cho GioHang

    public GioHangId getId() { return id; }
    public void setId(GioHangId id) { this.id = id; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }

    public LocalDate getNgayThem() { return ngayThem; }
    public void setNgayThem(LocalDate ngayThem) { this.ngayThem = ngayThem; }

    public DocGia getDocGia() { return docGia; }
    public void setDocGia(DocGia docGia) { this.docGia = docGia; }

    public Sach getSach() { return sach; }
    public void setSach(Sach sach) { this.sach = sach; }

}  
