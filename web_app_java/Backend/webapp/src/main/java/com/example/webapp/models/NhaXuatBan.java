package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "NHAXUATBAN")
public class NhaXuatBan {

    @Id
    @Column(name = "MANXB", length = 30, nullable = false)
    private String maNhaXuatBan;

    @NotNull
    @Column(name = "TENNXB", length = 25, nullable = false)
    private String tenNhaXuatBan;

    @Column(name = "DIACHI", columnDefinition = "TEXT")
    private String diaChi;
}

    