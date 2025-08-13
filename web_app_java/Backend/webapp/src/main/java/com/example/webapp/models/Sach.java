package com.example.webapp.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import java.util.HashSet;
import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

@Entity
@Table(name = "SACH")
public class Sach {

    @Id
    @Column(name = "MASACH", length = 30, nullable = false)
    private String maSach;

    @NotNull
    @Column(name = "TENSACH", length = 100, nullable = false)
    private String tenSach;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "DONGIA", nullable = false)
    private BigDecimal donGia;

    @NotNull
    @Column(name = "SOQUYEN", nullable = false)
    private int soQuyen;

    @NotNull
    @Min(0)
    @Column(name = "SOLUONG", nullable = false)
    private int soLuong;

    @NotNull
    @Column(name = "NAMXUATBAN", nullable = false)
    private LocalDate namXuatBan;

    @NotNull
    @Column(name = "TACGIA", length = 25, nullable = false)
    private String tacGia;

    @Column(name = "MOTA", columnDefinition = "TEXT")
    private String moTa;

    @NotNull
    @Column(name = "ANHBIA", length = 255, nullable = false)
    private String anhBia;

    @Column(name = "DIEMDANHGIA")
    private Double diemDanhGia;

    @Column(name = "GIAMGIA")
    private Double giamGia;

    @ManyToOne
    @JoinColumn(name = "MANXB", referencedColumnName = "MANXB")
    private NhaXuatBan nhaXuatBan;

    @ManyToMany
    @JoinTable(
        name = "SACH_THELOAI",
        joinColumns = @JoinColumn(name = "MASACH"),
        inverseJoinColumns = @JoinColumn(name = "MATHELOAI")
    )
    private Set<TheLoai> theLoais = new HashSet<>();

}