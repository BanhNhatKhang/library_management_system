package com.example.webapp.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "THEODOIMUONSACH")
public class TheoDoiMuonSach {

    @EmbeddedId
    private TheoDoiMuonSachId id;

    @NotNull
    @Column(name = "NGAYTRA", nullable = false)
    private LocalDate ngayTra;

    public enum TrangThaiMuon {
        CHODUYET,
        DADUYET,
        TUCHOI,
        DATRA,
        DANGMUON
    }

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "TRANGTHAIMUON", nullable = false)
    private TrangThaiMuon trangThaiMuon;

    @ManyToOne(optional = false)
    @MapsId("maDocGia")
    @JoinColumn(name = "MADOCGIA", referencedColumnName = "MADOCGIA")
    private DocGia docGia;

    @ManyToOne(optional = false)
    @MapsId("maSach")
    @JoinColumn(name = "MASACH", referencedColumnName = "MASACH")
    private Sach sach;

    @ManyToOne(optional = true)
    @JoinColumn(name = "MANHANVIEN", referencedColumnName = "MANHANVIEN")
    private NhanVien nhanVien;

    public TheoDoiMuonSach() {}

    public TheoDoiMuonSach(TheoDoiMuonSachId id, LocalDate ngayTra, TrangThaiMuon trangThaiMuon) {
        this.id = id;
        this.ngayTra = ngayTra;
        this.trangThaiMuon = trangThaiMuon;
    }

    // Getters và Setters cho TheoDoiMuonSach

    public TheoDoiMuonSachId getId() { return id; }
    public void setId(TheoDoiMuonSachId id) { this.id = id; }

    public LocalDate getNgayTra() {return ngayTra;}
    public void setNgayTra(LocalDate ngayTra) {this.ngayTra = ngayTra;}

    public TrangThaiMuon getTrangThaiMuon() { return trangThaiMuon; }
    public void setTrangThaiMuon(TrangThaiMuon trangThaiMuon) { this.trangThaiMuon = trangThaiMuon; }

    public DocGia getDocGia() { return docGia; }
    public void setDocGia(DocGia docGia) { this.docGia = docGia; }

    public Sach getSach() { return sach; }
    public void setSach(Sach sach) { this.sach = sach; }

    public NhanVien getNhanVien() { return nhanVien; }
    public void setNhanVien(NhanVien nhanVien) { this.nhanVien = nhanVien; }

}
