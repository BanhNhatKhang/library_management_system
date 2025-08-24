package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import java.math.BigDecimal;


@Entity
@Table(name = "DANHGIA")
public class DanhGia {

    @EmbeddedId
    private DanhGiaId id;

    @Column(name = "BINHLUAN", columnDefinition = "TEXT")
    private String binhLuan;

    @DecimalMin("0.00")
    @DecimalMax("5.00")
    @Column(name = "DIEM", precision = 2, scale = 1)
    private BigDecimal diem;

    @ManyToOne(optional = false)
    @MapsId("maDocGia")
    @JoinColumn(name = "MADOCGIA", referencedColumnName = "MADOCGIA", nullable = false)
    private DocGia docGia;

    @ManyToOne(optional = false)
    @MapsId("maSach")
    @JoinColumn(name = "MASACH", referencedColumnName = "MASACH", nullable = false)
    private Sach sach;

    public DanhGia() {}

    public DanhGia(DanhGiaId id, String binhLuan, BigDecimal diem) {
        this.id = id;
        this.binhLuan = binhLuan;
        this.diem = diem;
    }

    // Getters và Setters cho DanhGia

    public DanhGiaId getId() { return id; }
    public void setId(DanhGiaId id) { this.id = id; }

    public String getBinhLuan() { return binhLuan; }
    public void setBinhLuan(String binhLuan) { this.binhLuan = binhLuan; }

    public BigDecimal getDiem() { return diem; }
    public void setDiem(BigDecimal diem) { this.diem = diem; }

    public DocGia getDocGia() { return docGia; }
    public void setDocGia(DocGia docGia) { this.docGia = docGia; }

    public Sach getSach() { return sach; }
    public void setSach(Sach sach) { this.sach = sach; }

}

