package com.example.webapp.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import java.util.HashSet;


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
}