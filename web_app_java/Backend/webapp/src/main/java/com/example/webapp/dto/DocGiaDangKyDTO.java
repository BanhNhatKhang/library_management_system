package com.example.webapp.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.*;

public class DocGiaDangKyDTO {

    private String maDocGia;

    @NotBlank(message = "Họ lót không được để trống")
    private String hoLot;

    @NotBlank(message = "Tên không được để trống")
    private String ten;

    private String vaiTro;

    @NotBlank(message = "Vui lòng xác định giới tính")
    private String gioiTinh;

    @NotBlank(message = "Vui lòng điền đầy đủ địa chỉ")
    private String diaChi;

    @Past(message = "Ngày sinh không hợp lệ")
    private LocalDate ngaySinh;

    @NotBlank(message = "Vui lòng điền số điện thoại")
    @Pattern(regexp = "\\d{10}", message = "Điện thoại phải đủ 10 chữ số")
    private String dienThoai;

    @NotBlank(message = "Vui lòng điền email")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu ít nhất phải có 8 ký tự")
    private String matKhau;

    // Getters and Setters

    public String getMaDocGia() {return maDocGia;}
    public void setMaDocGia(String maDocGia) {this.maDocGia = maDocGia;}

    public String getHoLot() {return hoLot;}
    public void setHoLot(String hoLot) {this.hoLot = hoLot;}

    public String getTen() {return ten;}
    public void setTen(String ten) {this.ten = ten;}

    public String getVaiTro() {return vaiTro;}
    public void setVaiTro(String vaiTro) {this.vaiTro = vaiTro;}

    public String getGioiTinh() {return gioiTinh;}
    public void setGioiTinh(String gioiTinh) {this.gioiTinh = gioiTinh;}

    public String getDiaChi() {return diaChi;}
    public void setDiaChi(String diaChi) {this.diaChi = diaChi;}

    public LocalDate getNgaySinh() {return ngaySinh;}
    public void setNgaySinh(LocalDate ngaySinh) {this.ngaySinh = ngaySinh;}

    public String getDienThoai() { return dienThoai;}
    public void setDienThoai(String dienThoai) { this.dienThoai = dienThoai;}

    public String getEmail() {return email;}
    public void setEmail(String email) {this.email = email;}

    public String getMatKhau() {return matKhau;}
    public void setMatKhau(String matKhau) {this.matKhau = matKhau;
    }
}