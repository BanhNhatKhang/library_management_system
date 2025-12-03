package com.example.webapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DoiMatKhauRequestDTO {
    
    @NotBlank(message = "Mật khẩu hiện tại không được để trống")
    private String matKhauHienTai;
    
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, message = "Mật khẩu mới ít nhất phải có 8 ký tự")
    private String matKhauMoi;
    
    @NotBlank(message = "Vui lòng nhập lại mật khẩu mới")
    private String nhapLaiMatKhauMoi;

    // Getters and Setters
    public String getMatKhauHienTai() {
        return matKhauHienTai;
    }

    public void setMatKhauHienTai(String matKhauHienTai) {
        this.matKhauHienTai = matKhauHienTai;
    }

    public String getMatKhauMoi() {
        return matKhauMoi;
    }

    public void setMatKhauMoi(String matKhauMoi) {
        this.matKhauMoi = matKhauMoi;
    }

    public String getNhapLaiMatKhauMoi() {
        return nhapLaiMatKhauMoi;
    }

    public void setNhapLaiMatKhauMoi(String nhapLaiMatKhauMoi) {
        this.nhapLaiMatKhauMoi = nhapLaiMatKhauMoi;
    }
}