package com.example.weijiahome.config;

import com.example.weijiahome.utils.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 跨域配置（保持不变）
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 无状态JWT认证（保持不变）
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // 核心权限配置
                .authorizeHttpRequests(auth -> auth
                        // 新增：放行静态资源（音乐、图片、JS、CSS等）
                        .requestMatchers(new AntPathRequestMatcher("/music/**")).permitAll() // 放行/music目录下所有文件
                        .requestMatchers(new AntPathRequestMatcher("/static/**")).permitAll() // 若静态资源在/static目录，也放行
                        .requestMatchers(new AntPathRequestMatcher("/**/*.mp3")).permitAll() // 也可按文件后缀放行
                        // 新增：放行 Knife4j 新版所有资源（关键！）
                        .requestMatchers(
                                new AntPathRequestMatcher("/doc.html"),
                                new AntPathRequestMatcher("/webjars/**"),
                                new AntPathRequestMatcher("/v3/api-docs/**"),
                                new AntPathRequestMatcher("/swagger-resources/**"),
                                new AntPathRequestMatcher("/swagger-ui/**"), // 兼容新版资源
                                new AntPathRequestMatcher("/favicon.ico"), // 解决图标403
                                new AntPathRequestMatcher("/v3/api-docs/swagger-config")
                        ).permitAll()
                        // ==============================================
                        // 1. 公开接口（游客可访问）
                        // ==============================================
                        // 首页/健康检查
                        .requestMatchers(new AntPathRequestMatcher("/")).permitAll()
                        // 文章相关（查询类接口）
                        .requestMatchers(new AntPathRequestMatcher("/api/articles", "GET")).permitAll() // 文章列表
                        .requestMatchers(new AntPathRequestMatcher("/api/articles/**", "GET")).permitAll() // 文章详情、点赞数/评论数查询
                        // 分类和标签（仅查询接口公开）
                        .requestMatchers(new AntPathRequestMatcher("/api/categories", "GET")).permitAll() // 分类列表
                        .requestMatchers(new AntPathRequestMatcher("/api/categories/**/articles", "GET")).permitAll() // 分类下的文章
                        .requestMatchers(new AntPathRequestMatcher("/api/tags", "GET")).permitAll() // 标签列表
                        .requestMatchers(new AntPathRequestMatcher("/api/tags/**/articles", "GET")).permitAll() // 标签下的文章
                        // 登录/注册接口
                        .requestMatchers(new AntPathRequestMatcher("/api/users/login", "POST")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/users/register", "POST")).permitAll()
                        // 静态资源/Swagger
                        .requestMatchers(new AntPathRequestMatcher("/swagger-ui/**"), new AntPathRequestMatcher("/v3/api-docs/**")).permitAll()

                        // ==============================================
                        // 2. 普通用户权限（ROLE_USER）
                        // ==============================================
                        // 文章操作（自己的内容）
                        .requestMatchers(new AntPathRequestMatcher("/api/articles/publish", "POST")).hasRole("USER") // 发布文章
                        .requestMatchers(new AntPathRequestMatcher("/api/articles/edit/**", "PUT")).hasRole("USER") // 编辑自己的文章（需后端额外校验所有权）
                        .requestMatchers(new AntPathRequestMatcher("/api/articles/delete/**", "DELETE")).hasRole("USER") // 删除自己的文章（需后端额外校验所有权）
                        // 互动操作（点赞、评论）
                        .requestMatchers(new AntPathRequestMatcher("/api/articles/like/**", "POST")).hasRole("USER")
                        .requestMatchers(new AntPathRequestMatcher("/api/articles/comment/**", "POST")).hasRole("USER")
                        // 个人中心
                        .requestMatchers(new AntPathRequestMatcher("/api/users/profile/**")).hasRole("USER") // 查看/编辑自己的资料
                        .requestMatchers(new AntPathRequestMatcher("/api/users/password/update")).hasRole("USER") // 修改自己的密码

                        // ==============================================
                        // 3. 管理员权限（ROLE_ADMIN）
                        // ==============================================
                        // 分类管理（创建/修改/删除）
                        .requestMatchers(new AntPathRequestMatcher("/api/categories", "POST")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/categories/**", "PUT")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/categories/**", "DELETE")).hasRole("ADMIN")
                        // 标签管理（创建/修改/删除）
                        .requestMatchers(new AntPathRequestMatcher("/api/tags", "POST")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/tags/**", "PUT")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/tags/**", "DELETE")).hasRole("ADMIN")
                        // 全量文章管理（编辑/删除任何文章）
                        .requestMatchers(new AntPathRequestMatcher("/api/articles/admin/edit/**", "PUT")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/articles/admin/delete/**", "DELETE")).hasRole("ADMIN")
                        // 用户管理
                        .requestMatchers(new AntPathRequestMatcher("/api/users/list", "GET")).hasRole("ADMIN") // 查看所有用户
                        .requestMatchers(new AntPathRequestMatcher("/api/users/role/**", "PUT")).hasRole("ADMIN") // 修改用户角色
                        .requestMatchers(new AntPathRequestMatcher("/api/users/**", "DELETE")).hasRole("ADMIN") // 删除用户
                        // 系统配置
                        .requestMatchers(new AntPathRequestMatcher("/api/system/**")).hasRole("ADMIN")

                        // ==============================================
                        // 4. 其他所有接口需登录（默认规则）
                        // ==============================================
                        .anyRequest().authenticated()
                )
                // 添加JWT过滤器
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // 关闭CSRF
                .csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }

    // 跨域配置（保持不变）
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174")); // 前端地址
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}