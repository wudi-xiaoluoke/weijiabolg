package com.example.weijiahome.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// 新增以下3个导入（关键！）
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;

@Configuration
public class Knife4jConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("我的博客系统 API 文档")
                        .version("1.0.0")
                        .description("使用 Knife4j + springdoc 生成的接口文档，支持在线调试")
                        .contact(new Contact()
                                .name("赵无极")
                                .email("your@email.com") // 替换为你的邮箱
                                .url("https://yourblog.com"))); // 替换为你的地址
    }
}