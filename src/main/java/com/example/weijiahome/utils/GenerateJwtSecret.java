package com.example.weijiahome.utils;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Base64;

public class GenerateJwtSecret {
    public static void main(String[] args) {
        // 生成 HS512 所需的 512 位（64 字节）密钥
        byte[] keyBytes = Keys.secretKeyFor(SignatureAlgorithm.HS512).getEncoded();
        // 转为 Base64 字符串（方便配置存储）
        String base64Key = Base64.getEncoder().encodeToString(keyBytes);
        System.out.println("JWT 密钥（复制到配置文件）：" + base64Key);
    }
}