package com.example.webapp.dto;

public class JwtResponse {
    private String token;
    private String refreshToken;
    private String role;
    private String name;
    private String trangThai;

    public JwtResponse() {
    }

    public JwtResponse(String token, String refreshToken, String role, String name, String trangThai) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.role = role;
        this.name = name;
        this.trangThai = trangThai;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

}
