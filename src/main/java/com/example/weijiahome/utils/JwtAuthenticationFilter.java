package com.example.weijiahome.utils;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.weijiahome.entity.po.Users;
import com.example.weijiahome.service.IUsersService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final IUsersService usersService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, IUsersService usersService) {
        this.jwtUtil = jwtUtil;
        this.usersService = usersService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String requestUri = request.getRequestURI();
        logger.info("处理请求: {}", requestUri);

        try {
            String authHeader = request.getHeader("Authorization");
            String token = null;
            String userId = null;

            // 1. 提取请求头中的Token（仅当Authorization头以Bearer开头时）
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7).trim(); // 去除"Bearer "前缀，获取纯Token
                // 尝试从Token中解析用户ID（若Token格式错误，此处会抛出异常，进入catch块）
                userId = jwtUtil.getUserIdFromToken(token);
                logger.debug("从Token中解析到用户ID: {}", userId);
            }

            // 2. 仅当Token存在、用户ID非空，且当前未认证时，执行Token校验
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // 校验Token有效性（过期、签名等）
                if (jwtUtil.validateToken(token)) {
                    // 3. 根据用户ID查询数据库中的用户信息
                    Users user = usersService.getOne(new QueryWrapper<Users>().eq("id", userId));
                    if (user == null) {
                        logger.warn("Token中的用户ID不存在，ID: {}", userId);
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("用户不存在，Token无效");
                        return;
                    }

                    // 4. 解析Token中的角色，映射为Spring Security的权限（ROLE_前缀必须）
                    Integer role = jwtUtil.getRoleFromToken(token);
                    logger.info("解析到用户角色：{}，用户ID：{}", role, userId);
                    List<GrantedAuthority> authorities = new ArrayList<>();
                    if (role == 1) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                        logger.debug("用户 {} 角色：管理员（ROLE_ADMIN）", userId);
                    } else if (role == 2) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                        logger.debug("用户 {} 角色：普通用户（ROLE_USER）", userId);
                    } else if (role == 3) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_GUEST"));
                        logger.debug("用户 {} 角色：游客（ROLE_GUEST）", userId);
                    } else {
                        logger.warn("用户 {} 存在未知角色：{}", userId, role);
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.getWriter().write("未知角色，权限不足");
                        return;
                    }

                    // 5. 构建Spring Security认证对象，存入SecurityContext
                    UserDetails userDetails = User.builder()
                            .username(user.getUsername()) // 用户名（用于后续权限判断）
                            .password(user.getPassword()) // 密码（Spring Security内部校验用，此处已加密）
                            .authorities(authorities) // 用户权限列表
                            .build();

                    // 创建认证Token（第二个参数为凭证，此处为null，因JWT已校验）
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    // 设置请求详情（如IP、Session等）
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    // 将认证信息存入上下文，后续接口可通过SecurityContext获取用户信息
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("用户 {} 认证成功，已存入SecurityContext", userId);
                } else {
                    // Token无效（过期、签名错误等）
                    logger.warn("Token无效或已过期，请求路径：{}", requestUri);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Token无效或已过期，请重新登录");
                    return;
                }
            }

            // 6. 放行请求（关键！无论是否有Token，都继续执行过滤器链，由SecurityConfig判断权限）
            // 无Token的请求会进入SecurityConfig的authorizeHttpRequests判断是否为公开接口
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            // 捕获Token解析、数据库查询等过程中的异常
            logger.error("Token处理异常，请求路径：{}，异常信息：{}", requestUri, e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("认证失败：" + e.getMessage());
        }
    }
}