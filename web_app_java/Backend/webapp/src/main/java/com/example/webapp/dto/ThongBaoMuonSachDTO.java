package com.example.webapp.dto;

import java.time.LocalDateTime;

public class ThongBaoMuonSachDTO {
    private Long id;
    private String maDocGia;
    private String maSach;
    private String ngayMuon;
    private String noiDung;
    private LocalDateTime thoiGianGui;
    private String loaiThongBao;
    private Boolean trangThaiDaDoc;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMaDocGia() { return maDocGia; }
    public void setMaDocGia(String maDocGia) { this.maDocGia = maDocGia; }

    public String getMaSach() { return maSach; }
    public void setMaSach(String maSach) { this.maSach = maSach; }

    public String getNgayMuon() { return ngayMuon; }
    public void setNgayMuon(String ngayMuon) { this.ngayMuon = ngayMuon; }

    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }

    public LocalDateTime getThoiGianGui() { return thoiGianGui; }
    public void setThoiGianGui(LocalDateTime thoiGianGui) { this.thoiGianGui = thoiGianGui; }

    public String getLoaiThongBao() { return loaiThongBao; }
    public void setLoaiThongBao(String loaiThongBao) { this.loaiThongBao = loaiThongBao; }

    public Boolean getTrangThaiDaDoc() { return trangThaiDaDoc; }
    public void setTrangThaiDaDoc(Boolean trangThaiDaDoc) { this.trangThaiDaDoc = trangThaiDaDoc; }
}