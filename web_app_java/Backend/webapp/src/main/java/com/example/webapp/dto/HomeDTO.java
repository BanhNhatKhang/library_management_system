package com.example.webapp.dto;

import java.util.List;

public class HomeDTO {
    private String maTheLoai;
    private String tenTheLoai;
    private List<UuDaiDTO> uuDaiList;
    private List<NhaXuatBanDTO> nhaXuatBanList;
    private List<SachDTO> sachList;

    
    public String getMaTheLoai() { return maTheLoai; }
    public void setMaTheLoai(String maTheLoai) { this.maTheLoai = maTheLoai; }

    public String getTenTheLoai() { return tenTheLoai; }
    public void setTenTheLoai(String tenTheLoai) { this.tenTheLoai = tenTheLoai; }

    public List<UuDaiDTO> getUuDaList() { return uuDaiList;}
    public void setUuDaiList(List<UuDaiDTO> uuDaiList) {this.uuDaiList = uuDaiList;}

    public List<NhaXuatBanDTO> getNhaXuatBanList() {return nhaXuatBanList;}
    public void setNhaXuatBanListt(List<NhaXuatBanDTO> nhaXuatBanList) { this.nhaXuatBanList = nhaXuatBanList; }

    public List<SachDTO> getSachList() { return sachList; }
    public void setSachList(List<SachDTO> sachList) { this.sachList = sachList; }
}