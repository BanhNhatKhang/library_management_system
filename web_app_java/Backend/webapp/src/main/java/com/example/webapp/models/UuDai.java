package com.example.webapp.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "UUDAI")
public class UuDai {

    @Id
    @Column(name ="MAUUDAI", length = 30, nullable = false)
    private String maUuDai;

    @NotNull
    @Column(name = "TENUUDAI", nullable = false, columnDefinition = "TEXT")
    private String tenUuDai;

    @NotNull
    @Column(name = "MOTA", nullable = false, columnDefinition = "TEXT")
    private String moTa;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Column(name = "PHANTRAMGIAM", nullable = false, precision = 10, scale = 2)
    private BigDecimal phanTramGiam;

    @NotNull
    @Column(name = "NGAYBATDAU", nullable = false)
    private LocalDate ngayBatDau;

    
    @NotNull
    @Column(name = "NGAYKETTHUC", nullable = false)
    private LocalDate ngayKetThuc;

    @AssertTrue(message = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu")
    @Transient
    public boolean isNgayKetThuHopLe() {
        return ngayKetThuc == null || ngayBatDau == null || !ngayKetThuc.isBefore(ngayBatDau);
    }

    @ManyToMany(mappedBy = "uuDais")
    private Set<DonHang> donHangs = new HashSet<>();

}