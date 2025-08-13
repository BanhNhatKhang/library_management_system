package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;
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

}

