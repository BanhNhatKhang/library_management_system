package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "LICHSUTRACUAI")
public class LichSuTraCuAi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false, updatable = false)
    private Long id;

    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}

    // Quan hệ với Độc giả
    @ManyToOne
    @JoinColumn(name = "MADOCGIA", referencedColumnName = "MADOCGIA", foreignKey = @ForeignKey(name = "fk_docgia"))
    private DocGia docGia;

    public DocGia getDocGia() {return docGia;}
    public void setDocGia(DocGia docGia) {this.docGia = docGia;}

    // Quan hệ với Sách
    @ManyToOne
    @JoinColumn(name = "MASACH", referencedColumnName = "MASACH", foreignKey = @ForeignKey(name = "fk_sach"))
    private Sach sach;

    public Sach getSach() {return sach;}
    public void setSach(Sach sach) {this.sach = sach;}

    // Quan hệ với Đánh giá (3 cột khóa ngoại)
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "MADOCGIA", referencedColumnName = "MADOCGIA", insertable = false, updatable = false),
        @JoinColumn(name = "MASACH", referencedColumnName = "MASACH", insertable = false, updatable = false),
        @JoinColumn(name = "NGAYDANHGIA", referencedColumnName = "NGAYDANHGIA", insertable = false, updatable = false)
    })
    private DanhGia danhGia;
    
    public DanhGia getDanhGia() {return danhGia;}
    public void setDanhGia(DanhGia danhGia) {this.danhGia = danhGia;}

    @NotNull
    @Column(name = "TRACU", columnDefinition = "TEXT", nullable = false)
    private String traCu;

    public String getTraCu() {return traCu;}
    public void setTraCu(String traCu) {this.traCu = traCu;}

    @NotNull
    @Column(name = "KETQUA", columnDefinition = "TEXT", nullable = false)
    private String ketQua;

    public String getKetQua() {return ketQua;}
    public void setKetQua(String ketQua) {this.ketQua = ketQua;}

    @NotNull
    @Column(name = "THOIGIAN", nullable = false, updatable = false, insertable = false)
    private LocalDateTime thoiGian;

    public LocalDateTime getThoiGian() {return thoiGian;}
    public void setThoiGian(LocalDateTime thoiGian) {this.thoiGian = thoiGian;}

    @Column(name = "NOIDUNG_TSV", columnDefinition = "TSVECTOR", insertable = false, updatable = false)
    private String noiDungTsv;

    public String getNoiDungTsv() {return noiDungTsv;}
    public void setNoiDungTsv(String noiDungTsv) {this.noiDungTsv = noiDungTsv;}

    @PrePersist
    public void prePersist() {
        if (thoiGian == null) {
            thoiGian = LocalDateTime.now();
        }
    }

}
