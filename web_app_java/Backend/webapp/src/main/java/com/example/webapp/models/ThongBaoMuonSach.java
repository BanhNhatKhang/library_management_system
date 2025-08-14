package com.example.webapp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "THONGBAOMUONSACH")
public class ThongBaoMuonSach {

    @Id
    @Column(name = "ID", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "MADOCGIA", referencedColumnName = "MADOCGIA", nullable = false),
        @JoinColumn(name = "MASACH", referencedColumnName = "MASACH", nullable = false),
        @JoinColumn(name = "NGAYMUON", referencedColumnName = "NGAYMUON", nullable = false)
    })
    private TheoDoiMuonSach theoDoiMuonSach;

    @NotNull
    @Column(name = "NOIDUNG", columnDefinition = "TEXT", nullable = false)
    private String noiDung;

    @NotNull
    @Column(name = "THOIGIANGUI", nullable = false, updatable = false)
    private LocalDateTime thoiGianGui = LocalDateTime.now();

    public enum LoaiThongBao {
        SAPTOIHAN,
        QUAHAN,
        DATRASACH
    }
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "LOAITHONGBAO", length = 20, nullable = false)
    private LoaiThongBao loaiThongBao;

    @Column(name = "TRANGTHAIDADOC", nullable = false)
    private Boolean trangThaiDaDoc = false;

    public ThongBaoMuonSach() {}

    public ThongBaoMuonSach(TheoDoiMuonSach theoDoiMuonSach, String noiDung, LocalDateTime thoiGianGui, LoaiThongBao loaiThongBao, Boolean trangThaiDaDoc) {
        this.theoDoiMuonSach = theoDoiMuonSach;
        this.noiDung = noiDung;
        this.thoiGianGui = thoiGianGui != null ? thoiGianGui : LocalDateTime.now();
        this.loaiThongBao = loaiThongBao;
        this.trangThaiDaDoc = trangThaiDaDoc != null ? trangThaiDaDoc : false;
    }

    public Long getId() {return id;}

    public TheoDoiMuonSach getTheoDoiMuonSach() {return theoDoiMuonSach;}
    public void setTheoDoiMuonSach(TheoDoiMuonSach theoDoiMuonSach) {this.theoDoiMuonSach = theoDoiMuonSach;}

    public String getNoiDung() {return noiDung;}
    public void setNoiDung(String noiDung) {this.noiDung = noiDung;}

    public LocalDateTime getThoiGianGui() {return thoiGianGui;}
    public void setThoiGianGui(LocalDateTime thoiGianGui) {this.thoiGianGui = thoiGianGui;}

    public LoaiThongBao getLoaiThongBao() {return loaiThongBao;}
    public void setLoaiThongBao(LoaiThongBao loaiThongBao) {this.loaiThongBao = loaiThongBao;}

    public Boolean getTrangThaiDaDoc() {return trangThaiDaDoc;}
    public void setTrangThaiDaDoc(Boolean trangThaiDaDoc) {this.trangThaiDaDoc = trangThaiDaDoc;}
}
