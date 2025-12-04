package com.example.webapp.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference; 
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
import java.util.Base64;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

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
        
        if (isPublicPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        String token = null;

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        }

        System.out.println("JWT Filter - Path: " + path);
        System.out.println("JWT Filter - Token received: " + (token != null));

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                boolean isTokenValid = JwtUtil.validateJwtToken(token);
                System.out.println("JWT Filter - Token Valid: " + isTokenValid);

                if (isTokenValid) {
                    // Try to get username and role from JwtUtil first
                    String username = JwtUtil.getUsernameFromToken(token); // may be null
                    String role = JwtUtil.extractRole(token); // may be null
                    System.out.println("JWT Filter - Extracted Username: " + username);
                    System.out.println("JWT Filter - Extracted Role: " + role);

                    // If JwtUtil didn't return claims, decode payload as fallback
                    if ((username == null || role == null)) {
                        try {
                            String[] parts = token.split("\\.");
                            if (parts.length >= 2) {
                                String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
                                ObjectMapper om = new ObjectMapper();
                                Map<String, Object> claims = om.readValue(payloadJson, new TypeReference<Map<String, Object>>() {});
                                
                                if (username == null) {
                                    Object sub = claims.get("sub");
                                    if (sub != null) username = sub.toString();
                                }
                                if (role == null) {
                                    Object r = claims.get("role");
                                    if (r == null) r = claims.get("roles");
                                    if (r != null) role = r.toString();
                                }
                                
                                // Thêm thông tin về thời gian hết hạn từ payload
                                Object exp = claims.get("exp");
                                if (exp != null) {
                                    long expTime = ((Number) exp).longValue() * 1000; // Convert to milliseconds
                                    java.util.Date expirationDate = new java.util.Date(expTime);
                                    boolean isExpired = expirationDate.before(new java.util.Date());
                                    System.out.println("JWT Filter - Token expires at: " + expirationDate);
                                    System.out.println("JWT Filter - Token is expired: " + isExpired);
                                }
                                
                                System.out.println("JWT Filter - Fallback parsed subject:" + username + " role:" + role);
                            }
                        } catch (Exception ex) {
                            System.out.println("JWT Filter - fallback parse failed: " + ex.getMessage());
                        }
                    }

                    // Build authorities to be permissive: include both "ROLE_x" and raw "x"
                    Set<org.springframework.security.core.GrantedAuthority> authorities = new HashSet<>();
                    if (role != null && !role.isBlank()) {
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(role)); // raw
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role)); // prefixed
                    }

                    Object principal = null;
                    if (username != null) {
                        try {
                            principal = userDetailsService.loadUserByUsername(username);
                        } catch (Exception e) {
                            // If loading user fails, fall back to using username string as principal
                            principal = username;
                        }
                    } else {
                        principal = token; // least-ideal fallback
                    }

                    UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println("JWT Filter - Authentication set: principal=" + (username != null ? username : "token") + " authorities=" + authorities);
                }
            } catch (Exception e) {
                System.out.println("Error in JWT filter: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
    
    private boolean isPublicPath(String path) {
        return path.startsWith("/api/xacthuc/") ||
               path.startsWith("/api/home") ||
               path.startsWith("/api/sach/image") ||
               path.matches("/api/sach/id/.*") ||
               path.matches("/api/sach/ten/.*") ||
               path.matches("/api/sach/tacgia/.*");
    }
}