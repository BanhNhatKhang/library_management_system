package com.example.webapp.dto;

import java.util.List;

public class SachRequestDTO {
    private SachDTO sach;
    private String maNhaXuatBan;
    private List<String> maTheLoaiList;

    public SachDTO getSach() {return sach;}
    public void setSach(SachDTO sach) {this.sach = sach;}

    public String getMaNhaXuatBan() {return maNhaXuatBan;}
    public void setMaNhaXuatBan(String maNhaXuatBan) {this.maNhaXuatBan = maNhaXuatBan;}

    public List<String> getMaTheLoaiList() {return maTheLoaiList;}

    public void setMaTheLoaiList(List<String> maTheLoaiList) {this.maTheLoaiList = maTheLoaiList;}
}