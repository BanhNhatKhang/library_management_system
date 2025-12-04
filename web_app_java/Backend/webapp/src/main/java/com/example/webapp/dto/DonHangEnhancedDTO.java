package com.example.webapp.dto;

import java.math.BigDecimal;

public class DonHangEnhancedDTO extends DonHangDTO {
    private String uuDaiApDung;
    private BigDecimal tongGiamGia;
    
    // Getters and Setters
    public String getUuDaiApDung() {
        return uuDaiApDung;
    }
    
    public void setUuDaiApDung(String uuDaiApDung) {
        this.uuDaiApDung = uuDaiApDung;
    }
    
    public BigDecimal getTongGiamGia() {
        return tongGiamGia;
    }
    
    public void setTongGiamGia(BigDecimal tongGiamGia) {
        this.tongGiamGia = tongGiamGia;
    }
}