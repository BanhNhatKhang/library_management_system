package com.example.webapp.models;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
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
    @Column(name = "TRANGTHAIMUON", columnDefinition = "TRANGTHAI_MUON", nullable = false)
    @org.hibernate.annotations.Type(type = "pgsql_enum")
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
}
