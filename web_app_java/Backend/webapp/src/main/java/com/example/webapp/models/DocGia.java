package com.example.webapp.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "DOCGIA")
public class DocGia {

    @Id
    @Column(name = "MADOCGIA", length = 30, nullable = false)
    private String maDocGia;

    @NotNull
    @Column(name = "HOLOT", length = 30, nullable = false)
    private String hoLot;

    @NotNull
    @Column(name = "TEN", length = 10, nullable = false)
    private String ten;

    public enum VaiTroDocGia{
        DOCGIA
    }
    @Enumerated(EnumType.STRING)
    @Column(name = "VAITRO", columnDefinition = "VAITRO_DOCGIA")
    @org.hibernate.annotations.Type(type = "pgsql_enum")
    private VaiTroDocGia vaiTro = VaiTroDocGia.DOCGIA;

    public enum GioiTinh {
        NAM,
        NU
    }
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "GIOITINH", columnDefinition = "GIOI_TINH", nullable = false)
    @org.hibernate.annotations.Type(type = "pgsql_enum")
    private GioiTinh gioiTinh;

    @Column(name = "DIACHI", columnDefinition = "TEXT")
    private String diaChi;

    @NotNull
    @Column(name = "NGAYSINH", nullable = false)
    private LocalDate ngaySinh;

    @NotNull
    @Column(name = "DIENTHOAI", length = 15, nullable = false, unique = true)
    private String dienThoai;

    @NotNull
    @Column(name = "EMAIL", length = 100, nullable = false, unique = true)
    private String email;

    @NotNull
    @Column(name = "MATKHAU", length = 100, nullable = false)
    private String matKhau;

    public enum TrangThaiDocGia {
        HOATDONG,
        TAMKHOA,
        CAM
    }
    @Enumerated(EnumType.STRING)
    @Column(name = "TRANGTHAI", columnDefinition = "TRANGTHAI_DOCGIA")
    @org.hibernate.annotations.Type(type = "pgsql_enum")
    private TrangThaiDocGia trangThai = TrangThaiDocGia.HOATDONG;


}