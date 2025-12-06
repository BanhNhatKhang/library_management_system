package com.example.webapp.models;

import jakarta.persistence.*;
import java.time.LocalDate;
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
    @Column(name = "VAITRO")
    private VaiTroDocGia vaiTro = VaiTroDocGia.DOCGIA;

    public enum GioiTinh {
        NAM,
        NU
    }
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "GIOITINH", nullable = false)
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
    @Column(name = "TRANGTHAI")
    private TrangThaiDocGia trangThai = TrangThaiDocGia.HOATDONG;

    // THÊM: Quan hệ Many-to-Many với UuDai đã lưu
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "DOCGIA_UUDAI_DALUU",
        joinColumns = @JoinColumn(name = "MADOCGIA"),
        inverseJoinColumns = @JoinColumn(name = "MAUUDAI")
    )
    private Set<UuDai> uuDaisDaLuu = new HashSet<>();

    // Constructors
    public DocGia() {}

    public DocGia(String maDocGia, String hoLot, String ten, VaiTroDocGia vaiTro, GioiTinh gioiTinh, String diaChi, LocalDate ngaySinh, String dienThoai, String email, String matKhau, TrangThaiDocGia trangThai) {
        this.maDocGia = maDocGia;
        this.hoLot = hoLot;
        this.ten = ten;
        this.vaiTro = vaiTro;
        this.gioiTinh = gioiTinh;
        this.diaChi = diaChi;
        this.ngaySinh = ngaySinh;
        this.dienThoai = dienThoai;
        this.email = email;
        this.matKhau = matKhau;
        this.trangThai = trangThai;
    }

    // Getters và Setters cho DocGia (existing)
    public String getMaDocGia() { return maDocGia; }
    public void setMaDocGia(String maDocGia) { this.maDocGia = maDocGia; }

    public String getHoLot() { return hoLot; }
    public void setHoLot(String hoLot) { this.hoLot = hoLot; }

    public String getTen() { return ten; }
    public void setTen(String ten) { this.ten = ten; }

    public VaiTroDocGia getVaiTro() { return vaiTro; }
    public void setVaiTro(VaiTroDocGia vaiTro) { this.vaiTro = vaiTro; }

    public GioiTinh getGioiTinh() { return gioiTinh; }
    public void setGioiTinh(GioiTinh gioiTinh) { this.gioiTinh = gioiTinh; }

    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }

    public LocalDate getNgaySinh() { return ngaySinh; }
    public void setNgaySinh(LocalDate ngaySinh) { this.ngaySinh = ngaySinh; }

    public String getDienThoai() { return dienThoai; }
    public void setDienThoai(String dienThoai) { this.dienThoai = dienThoai; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMatKhau() { return matKhau; }
    public void setMatKhau(String matKhau) { this.matKhau = matKhau; }

    public TrangThaiDocGia getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiDocGia trangThai) { this.trangThai = trangThai; }

    // THÊM: Getter và Setter cho ưu đãi đã lưu
    public Set<UuDai> getUuDaisDaLuu() {
        return uuDaisDaLuu;
    }

    public void setUuDaisDaLuu(Set<UuDai> uuDaisDaLuu) {
        this.uuDaisDaLuu = uuDaisDaLuu;
    }

    // THÊM: Helper methods để quản lý ưu đãi
    public void addUuDaiDaLuu(UuDai uuDai) {
        this.uuDaisDaLuu.add(uuDai);
    }

    public void removeUuDaiDaLuu(UuDai uuDai) {
        this.uuDaisDaLuu.remove(uuDai);
    }

    public boolean hasUuDaiDaLuu(UuDai uuDai) {
        return this.uuDaisDaLuu.contains(uuDai);
    }
}