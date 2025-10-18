package com.example.webapp.dto;

public class JwtResponse {
    private String token;
    private String role;
    private String name;

    public JwtResponse() {
    }

    public JwtResponse(String token, String role, String name) {
        this.token = token;
        this.role = role;
        this.name = name;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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
}
