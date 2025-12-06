package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;

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
    @Column(
        name = "VAITRO",
        nullable = false
    )
    private VaiTroNhanVien vaiTro;


    public enum TrangThaiNhanVien {
        HOATDONG,
        NGHI,
        KHOA
    }
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(
        name = "TRANGTHAI",
        nullable = false
        // KHÔNG cần columnDefinition ở đây, Hibernate sẽ tự map
    )
    private TrangThaiNhanVien trangThai;

    @NotNull
    @Column(name = "NGAYSINH", nullable = false)
    private LocalDate ngaySinh;

    @NotNull
    @Column(name = "DIACHI", length = 255, nullable = false)
    private String diaChi;

    public NhanVien() {}

    public NhanVien(String maNhanVien, String hoTenNV, String email, String dienThoai, String matKhau, VaiTroNhanVien vaiTro, String diaChi, TrangThaiNhanVien trangThai, LocalDate ngaySinh) {
        this.maNhanVien = maNhanVien;
        this.hoTenNV = hoTenNV;
        this.email = email;
        this.dienThoai = dienThoai;
        this.matKhau = matKhau;
        this.vaiTro = vaiTro;
        this.diaChi = diaChi;
        this.trangThai = trangThai;
        this.ngaySinh = ngaySinh;
    }

    // Getters và Setters cho NhanVien

    public String getMaNhanVien() { return maNhanVien; }
    public void setMaNhanVien(String maNhanVien) { this.maNhanVien = maNhanVien; }

    public String getHoTenNV() { return hoTenNV; }
    public void setHoTenNV(String hoTenNV) { this.hoTenNV = hoTenNV; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDienThoai() { return dienThoai; }
    public void setDienThoai(String dienThoai) { this.dienThoai = dienThoai; }

    public String getMatKhau() { return matKhau; }
    public void setMatKhau(String matKhau) { this.matKhau = matKhau; }

    public VaiTroNhanVien getVaiTro() { return vaiTro; }
    public void setVaiTro(VaiTroNhanVien vaiTro) { this.vaiTro = vaiTro; }

    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }

    public TrangThaiNhanVien getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiNhanVien trangThai) { this.trangThai = trangThai; }

    public LocalDate getNgaySinh() { return ngaySinh; }
    public void setNgaySinh(LocalDate ngaySinh) { this.ngaySinh = ngaySinh; }
    
}