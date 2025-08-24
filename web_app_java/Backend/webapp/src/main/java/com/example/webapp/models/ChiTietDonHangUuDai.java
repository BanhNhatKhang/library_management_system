package com.example.webapp.models;

import jakarta.persistence.*;;

@Entity
@Table(name = "CHITIETDONHANGUUDAI")
public class ChiTietDonHangUuDai {

    @EmbeddedId
    private ChiTietDonHangUuDaiId id;

    @ManyToOne(optional = false)
    @MapsId("maDonHang")
    @JoinColumn(name = "MADONHANG", referencedColumnName = "MADONHANG")
    private DonHang donHang;

    @ManyToOne(optional = false)
    @MapsId("maSach")
    @JoinColumn(name = "MASACH", referencedColumnName = "MASACH")
    private Sach sach;

    @ManyToOne(optional = false)
    @MapsId("maUuDai")
    @JoinColumn(name = "MAUUDAI", referencedColumnName = "MAUUDAI")
    private UuDai uuDai;

    public ChiTietDonHangUuDai() {}

    // Getters và Setters cho ChiTietDonHangUuDai

    public ChiTietDonHangUuDaiId getId() { return id; }
    public void setId(ChiTietDonHangUuDaiId id) { this.id = id; }

    public DonHang getDonHang() { return donHang; }
    public void setDonHang(DonHang donHang) { this.donHang = donHang; }

    public Sach getSach() { return sach; }
    public void setSach(Sach sach) { this.sach = sach; }

    public UuDai getUuDai() { return uuDai; }
    public void setUuDai(UuDai uuDai) { this.uuDai = uuDai; }

}
