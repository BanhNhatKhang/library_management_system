package com.example.webapp.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "PHATDOCGIA")
public class PhatDocGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MAPHAT")
    private Long maPhat;

    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "MADOCGIA", referencedColumnName = "MADOCGIA", nullable = false),
        @JoinColumn(name = "MASACH", referencedColumnName = "MASACH", nullable = false),
        @JoinColumn(name = "NGAYMUON", referencedColumnName = "NGAYMUON", nullable = false)
    })
    private TheoDoiMuonSach theoDoiMuonSach;

    @NotNull
    @Column(name = "SOTIENPHAT", precision = 10, scale = 2, nullable = false)
    private BigDecimal soTienPhat;

    @NotNull
    @Column(name = "SONGAYQUAHAN", nullable = false)
    private int soNgayQuaHan;

    @NotNull
    @Column(name = "NGAYTAOPHAT", nullable = false)
    private LocalDateTime ngayTaoPhat = LocalDateTime.now();

    public enum TrangThaiPhat {
        CHUATHANHTOAN,
        DATHANHTOAN,
        MIENGIAM
    }

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "TRANGHAIPHAT", length = 20, nullable = false)
    private TrangThaiPhat trangThaiPhat = TrangThaiPhat.CHUATHANHTOAN;

    @Column(name = "NGAYTHANHTOAN")
    private LocalDateTime ngayThanhToan;

    @Column(name = "GHICHU", columnDefinition = "TEXT")
    private String ghiChu;

    public PhatDocGia() {}

    public PhatDocGia(TheoDoiMuonSach theoDoiMuonSach, BigDecimal soTienPhat, int soNgayQuaHan, String ghiChu) {
        this.theoDoiMuonSach = theoDoiMuonSach;
        this.soTienPhat = soTienPhat;
        this.soNgayQuaHan = soNgayQuaHan;
        this.ghiChu = ghiChu;
    }

    // Getters và Setters
    public Long getMaPhat() { return maPhat; }
    public void setMaPhat(Long maPhat) { this.maPhat = maPhat; }

    public TheoDoiMuonSach getTheoDoiMuonSach() { return theoDoiMuonSach; }
    public void setTheoDoiMuonSach(TheoDoiMuonSach theoDoiMuonSach) { this.theoDoiMuonSach = theoDoiMuonSach; }

    public BigDecimal getSoTienPhat() { return soTienPhat; }
    public void setSoTienPhat(BigDecimal soTienPhat) { this.soTienPhat = soTienPhat; }

    public int getSoNgayQuaHan() { return soNgayQuaHan; }
    public void setSoNgayQuaHan(int soNgayQuaHan) { this.soNgayQuaHan = soNgayQuaHan; }

    public LocalDateTime getNgayTaoPhat() { return ngayTaoPhat; }
    public void setNgayTaoPhat(LocalDateTime ngayTaoPhat) { this.ngayTaoPhat = ngayTaoPhat; }

    public TrangThaiPhat getTrangThaiPhat() { return trangThaiPhat; }
    public void setTrangThaiPhat(TrangThaiPhat trangThaiPhat) { this.trangThaiPhat = trangThaiPhat; }

    public LocalDateTime getNgayThanhToan() { return ngayThanhToan; }
    public void setNgayThanhToan(LocalDateTime ngayThanhToan) { this.ngayThanhToan = ngayThanhToan; }

    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
}