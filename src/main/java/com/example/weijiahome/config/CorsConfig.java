package com.example.weijiahome.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        // 1. 创建跨域配置对象
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*");  // 允许所有域名（生产环境需指定具体域名）
        config.setAllowCredentials(true);     // 允许携带Cookie
        config.addAllowedMethod("*");         // 允许所有HTTP方法（GET/POST等）
        config.addAllowedHeader("*");         // 允许所有请求头

        // 2. 配置生效的URL
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);  // 所有接口都生效

        // 3. 返回过滤器
        return new CorsFilter(source);
    }
}