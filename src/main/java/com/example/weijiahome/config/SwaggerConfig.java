package com.example.weijiahome.config;

import org.springdoc.core.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public GroupedOpenApi api() {
        return GroupedOpenApi.builder()
                .group("博客系统API")
                .pathsToMatch("/api/**")
                .build();
    }

    // 删除 swaggerUiConfigProperties 的 Bean 定义
}