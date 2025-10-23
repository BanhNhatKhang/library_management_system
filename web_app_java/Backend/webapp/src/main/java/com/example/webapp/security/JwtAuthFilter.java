package com.example.webapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        System.out.println("Request path: " + path);
        
        // Bỏ qua kiểm tra JWT cho các API public
        if (isPublicPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            username = JwtUtil.getUsernameFromToken(token);
        }

        System.out.println("JWT Filter - Path: " + path);
        System.out.println("JWT Filter - Token received: " + (token != null));
        System.out.println("JWT Filter - Extracted Username: " + username);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                var userDetails = userDetailsService.loadUserByUsername(username);

                boolean isTokenValid = JwtUtil.validateJwtToken(token);
                System.out.println("JWT Filter - Token Valid: " + isTokenValid);
                
                if (isTokenValid) {
                    // Lấy role từ JWT
                    String role = JwtUtil.extractRole(token);
                    // Tạo authority đúng chuẩn ROLE_*
                    var authorities = java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role));

                    System.out.println("JWT Filter - Granted Authorities: " + authorities);

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception e) {
                    System.out.println("Error loading user details or validating token: " + e.getMessage());
            }

        }
        
        filterChain.doFilter(request, response);
    }
    
    private boolean isPublicPath(String path) {
        return path.startsWith("/api/xacthuc/") ||
               path.startsWith("/api/home") ||
               path.startsWith("/api/sach/image");
    }
}