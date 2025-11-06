package com.example.weijiahome.utils;

import java.util.UUID;

public class ShareCodeUtil {
    // 生成10位唯一分享码（UUID截取，避免重复）
    public static String generateShareCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }
}