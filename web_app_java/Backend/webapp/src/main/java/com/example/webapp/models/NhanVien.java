package com.example.webapp.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "NHANVIEN")
public class NhanVien {

    @Id
    @Column(name = "MANHANVIEN", length = 30, nullable = false)
    private String maNhanVien;

    @NotNull
    @Column(name = "HOTENNV", length = 100, nullable = false)
    private String hoTenNV;

    @NotNull
    @Column(name = "EMAIL", length = 100, nullable = false, unique = true)
    private String email;

    @NotNull
    @Column(name = "DIENTHOAI", length = 15, nullable = false, unique = true)
    private String dienThoai;

    @NotNull
    @Column(name = "MATKHAU", length = 100, nullable = false)
    private String matKhau;

    public enum VaiTroNhanVien {
        THUTHU,
        QUANLY,
        NHANVIEN,
        ADMIN
    }

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "VAITRO", columnDefinition = "VAITRO_NHANVIEN", nullable = false)
    @org.hibernate.annotations.Type(type = "pgsql_enum")
    private VaiTroNhanVien vaiTro = VaiTroNhanVien.NHANVIEN;

    @Column(name = "DIACHI", columnDefinition = "TEXT")
    private String diaChi;

    public enum TrangThaiNhanVien {
        HOATDONG,
        NGHI,
        KHOA
    }
    @Enumerated(EnumType.STRING)
    @Column(name = "TRANGTHAI", columnDefinition = "TRANGTHAI_NHANVIEN", nullable = false)
    @org.hibernate.annotations.Type(type = "pgsql_enum")
    private TrangThaiNhanVien trangThai = TrangThaiNhanVien.HOATDONG;

    @NotNull
    @Column(name = "NGAYSINH", nullable = false)
    private LocalDate ngaySinh;
    
}