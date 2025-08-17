package com.example.webapp.dto;

import java.util.List;

public class DonHangRequestDTO {
    private DonHangDTO donHang;
    private String maDocGia;
    private List<String> maUuDaiList;

    public DonHangDTO getDonHang() {return donHang;}
    public void setDonHang(DonHangDTO donHang) {this.donHang = donHang;}

    public String getMaDocGia() {return maDocGia;}
    public void setMaDocGia(String maDocGia) {this.maDocGia = maDocGia;}

    public List<String> getMaUuDaiList() {return maUuDaiList;}
    public void setMaUuDaiList(List<String> maUuDaiList) {this.maUuDaiList = maUuDaiList;}
}