package com.example.weijiahome.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * BCrypt密码加密工具类
 */
@Component
public class PasswordUtil {

    // 初始化BCrypt加密器（可自定义强度，默认为10）
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    /**
     * 加密密码（注册/修改密码时使用）
     * @param rawPassword 原始密码（用户输入的明文）
     * @return 加密后的密码（存储到数据库）
     */
    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    /**
     * 验证密码（登录时使用）
     * @param rawPassword 前端输入的原始密码
     * @param encodedPassword 数据库中存储的加密密码
     * @return 验证通过返回true，否则返回false
     */
    public boolean matchesPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
