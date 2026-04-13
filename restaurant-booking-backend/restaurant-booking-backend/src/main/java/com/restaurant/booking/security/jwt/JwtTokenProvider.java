package com.restaurant.booking.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration}")
    private long jwtRefreshExpirationMs;

    // ── Key ────────────────────────────────────────────────────────────────────
    private Key signingKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ── Token generation ───────────────────────────────────────────────────────
    public String generateAccessToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return buildToken(userPrincipal.getUsername(), jwtExpirationMs);
    }

    public String generateAccessToken(String email) {
        return buildToken(email, jwtExpirationMs);
    }

    public String generateRefreshToken(String email) {
        return buildToken(email, jwtRefreshExpirationMs);
    }

    private String buildToken(String subject, long expirationMs) {
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                   .setSubject(subject)
                   .setIssuedAt(now)
                   .setExpiration(expiry)
                   .signWith(signingKey(), SignatureAlgorithm.HS256)
                   .compact();
    }

    // ── Token parsing ─────────────────────────────────────────────────────────
    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                   .setSigningKey(signingKey())
                   .build()
                   .parseClaimsJws(token)
                   .getBody();
    }
}
