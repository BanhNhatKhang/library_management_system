package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import java.util.HashSet;
import com.fasterxml.jackson.annotation.JsonIgnore;


@Entity
@Table(name = "THELOAI")
public class TheLoai {

    @Id
    @Column(name = "MATHELOAI", length = 30, nullable = false)
    private String maTheLoai;

    @NotNull
    @Column(name = "TENTHELOAI", length = 30, nullable = false)
    private String tenTheLoai;

    @ManyToMany(mappedBy = "theLoais")
    @JsonIgnore
    private Set<Sach> sachs = new HashSet<>();

    public TheLoai() {}

    public TheLoai(String maTheLoai, String tenTheLoai) {
        this.maTheLoai = maTheLoai;
        this.tenTheLoai = tenTheLoai;
    }


    // Getters và Setters cho TheLoai

    public String getMaTheLoai() { return maTheLoai; }
    public void setMaTheLoai(String maTheLoai) { this.maTheLoai = maTheLoai; }

    public String getTenTheLoai() { return tenTheLoai; }
    public void setTenTheLoai(String tenTheLoai) { this.tenTheLoai = tenTheLoai; }

    public Set<Sach> getSachs() { return sachs; }
    public void setSachs(Set<Sach> sachs) { this.sachs = sachs; }

}