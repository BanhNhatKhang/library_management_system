package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "CHITIETDONHANGUUDAI")
public class ChiTietDonHangUuDai {

    @EmbeddedId
    private ChiTietDonHangUuDaiId id;

    @ManyToOne(optional = false)
    @MapsId("maDonHang")
    @JoinColumn(name = "MADONHANG", referencedColumnName = "MADONHANG")
    private DonHang donHang;

    @ManyToOne(optional = false)
    @MapsId("maSach")
    @JoinColumn(name = "MASACH", referencedColumnName = "MASACH")
    private Sach sach;

    @ManyToOne(optional = false)
    @MapsId("maUuDai")
    @JoinColumn(name = "MAUUDAI", referencedColumnName = "MAUUDAI")
    private UuDai uuDai;

}
