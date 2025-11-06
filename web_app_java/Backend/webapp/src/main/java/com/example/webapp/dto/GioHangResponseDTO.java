package com.example.webapp.dto;

import java.math.BigDecimal;
import com.example.webapp.models.GioHang;

// DTO này dùng để trả về dữ liệu chi tiết giỏ hàng cho Client
public class GioHangResponseDTO {
    private String maDocGia;
    private String maSach;
    private int soLuong;
    
    // Thông tin từ Sach
    private String tenSach;
    private BigDecimal donGia;
    private Double giamGia;
    private String anhBia;

    // Constructors (Optional, nhưng hữu ích)
    public GioHangResponseDTO() {}

    public GioHangResponseDTO(GioHang gioHang) {
        this.maDocGia = gioHang.getId().getMaDocGia();
        this.maSach = gioHang.getId().getMaSach();
        this.soLuong = gioHang.getSoLuong();
        
        // Lấy thông tin từ đối tượng Sach được fetch sẵn
        this.tenSach = gioHang.getSach().getTenSach();
        this.donGia = gioHang.getSach().getDonGia();
        this.giamGia = gioHang.getSach().getGiamGia();
        this.anhBia = gioHang.getSach().getAnhBia();
    }

    // Getters và Setters
    public String getMaDocGia() { return maDocGia; }
    public void setMaDocGia(String maDocGia) { this.maDocGia = maDocGia; }

    public String getMaSach() { return maSach; }
    public void setMaSach(String maSach) { this.maSach = maSach; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }

    public String getTenSach() { return tenSach; }
    public void setTenSach(String tenSach) { this.tenSach = tenSach; }

    public BigDecimal getDonGia() { return donGia; }
    public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }

    public Double getGiamGia() { return giamGia; }
    public void setGiamGia(Double giamGia) { this.giamGia = giamGia; }

    public String getAnhBia() { return anhBia; }
    public void setAnhBia(String anhBia) { this.anhBia = anhBia; }
}