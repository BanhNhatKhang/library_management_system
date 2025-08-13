package com.example.webapp.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "DONHANG")
public class DonHang {

    @Id
    @Column(name = "MADONHANG", length = 30, nullable = false)
    private String maDonHang;

    @NotNull
    @Column(name = "NGAYDAT", nullable = false)
    private LocalDate ngayDat;

    @NotNull
    @Column(name = "TONGTIEN", nullable = false, precision = 10, scale = 2)
    private BigDecimal tongTien;

    public enum TrangThaiDonHang {
        DANGXULY,
        DAGIAO,
        DAHUY,
        GIAOTHATBAI
    }
    @Enumerated(EnumType.STRING)
    @Column(name = "TRANGTHAI", columnDefinition = "TRANGTHAI_DONHANG", nullable = false)
    @org.hibernate.annotations.Type(type = "pgsql_enum")
    private TrangThaiDonHang trangThai;

    @ManyToOne(optional = false)
    @JoinColumn(name = "MADOCGIA", referencedColumnName = "MADOCGIA", nullable = false)
    private DocGia docGia;

    @ManyToMany
    @JoinTable(
        name = "DONHANG_UUDAI",
        joinColumns = @JoinColumn(name = "MADONHANG"),
        inverseJoinColumns = @JoinColumn(name = "MAUUDAI")
    )

    private Set<UuDai> uuDais = new HashSet<>();

}