package com.example.weijiahome.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    // 从配置文件中获取Base64编码的JWT密钥（确保长度≥512位）
    @Value("${jwt.secret}")
    private String base64Secret;

    // 从配置文件中获取JWT过期时间（单位：毫秒）
    @Value("${jwt.expiration}")
    private Long expiration;

    // 解码Base64密钥
    private SecretKey getSecretKey() {
        byte[] keyBytes = Base64.getDecoder().decode(base64Secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    // 生成JWT令牌（存储用户ID）
    // 同时储存用户身份信息
    public String generateToken(String userId,Integer role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(userId)// 存储用户ID
                .claim("role", role) // 自定义声明：存储角色信息
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSecretKey(), SignatureAlgorithm.HS512)  // 使用安全密钥
                .compact();
    }

    // 从令牌中获取用户ID
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();  // 返回存储的用户ID
    }
    /**
     * 从令牌中获取角色
     */
    public Integer getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("role", Integer.class); // 获取自定义声明中的角色
    }

    // 验证令牌是否有效
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
