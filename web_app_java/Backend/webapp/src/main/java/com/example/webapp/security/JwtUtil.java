package com.example.webapp.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

import java.security.Key;
import java.util.Date;
import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private static String secret;
    private static long expirationMillis = 3600_000L; // 1 hour
    private static long refreshExpirationMillis = 604_800_000L; // 7 days
    private static long allowedClockSkewSeconds = 0L;

    @Value("${jwt.secret}")
    public void setSecret(String secretValue) {
        JwtUtil.secret = secretValue;
    }

    @Value("${jwt.expiration-ms:3600000}")
    public void setExpirationMillis(long expMs) {
        JwtUtil.expirationMillis = expMs;
    }

    @Value("${jwt.refresh-expiration-ms:604800000}")
    public void setRefreshExpirationMillis(long refreshExpMs) {
        JwtUtil.refreshExpirationMillis = refreshExpMs;
    }

    @Value("${jwt.allowed-clock-skew-seconds:0}")
    public void setAllowedClockSkewSeconds(long skewSeconds) {
        JwtUtil.allowedClockSkewSeconds = skewSeconds;
    }

    private static Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public static String generateToken(String subject, String role) {
        Map<String, Object> claims = Collections.singletonMap("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public static String generateRefreshToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMillis))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public static String extractRole(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }

    public static String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public static String getUsernameFromToken(String token) {
        try {
            return extractUsername(token);
        } catch (Exception e) {
            return null;
        }
    }

    public static boolean validateJwtToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getKey())
                .setAllowedClockSkewSeconds(allowedClockSkewSeconds)
                .build()
                .parseClaimsJws(token);
            System.out.println("JWT Validation Success");
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("JWT Validation Failed - Expired: " + e.getMessage());
            return false;
        } catch (JwtException e) {
            System.out.println("JWT Validation Failed - Error: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.out.println("JWT Validation Failed - Unexpected Error: " + e.getMessage());
            return false;
        }
    }

    public static boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(getKey())
                .setAllowedClockSkewSeconds(allowedClockSkewSeconds)
                .build()
                .parseClaimsJws(token)
                .getBody();

            Date expiration = claims.getExpiration();
            Date now = new Date();

            boolean expired = expiration.before(now);
            System.out.println("Token expiration: " + expiration);
            System.out.println("Current time: " + now);
            System.out.println("Token expired: " + expired);

            return expired;
        } catch (ExpiredJwtException e) {
            System.out.println("JWT isTokenExpired - ExpiredJwtException: " + e.getMessage());
            return true;
        } catch (Exception e) {
            System.out.println("JWT isTokenExpired - Other exception: " + e.getMessage());
            return true; // Coi như expired nếu không parse được
        }
    }
}