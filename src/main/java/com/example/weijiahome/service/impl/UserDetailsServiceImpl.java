package com.example.weijiahome.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.weijiahome.entity.po.Permission;
import com.example.weijiahome.entity.po.Role;
import com.example.weijiahome.entity.po.Users;

import com.example.weijiahome.mapper.PermissionMapper;
import com.example.weijiahome.mapper.RoleMapper;
import com.example.weijiahome.mapper.UsersMapper;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Resource
    private UsersMapper usersMapper;

    @Resource
    private RoleMapper roleMapper;

    @Resource
    private PermissionMapper permissionMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. 查询用户信息
        QueryWrapper<Users> userQuery = new QueryWrapper<>();
        userQuery.eq("username", username);
        Users user = usersMapper.selectOne(userQuery);
        if (user == null) {
            throw new UsernameNotFoundException("用户名或密码错误");
        }

        // 2. 查询用户的角色（基于现有role表：通过userId查询角色）
        QueryWrapper<Role> roleQuery = new QueryWrapper<>();
        roleQuery.eq("user_id", user.getId());
        List<Role> roles = roleMapper.selectList(roleQuery);

        // 3. 收集角色和权限（GrantedAuthority）
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (Role role : roles) {
            // 角色需要以 "ROLE_" 为前缀（Spring Security 规范）
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRoleName()));

            // 4. 查询角色对应的权限（基于现有permission表：通过roleId查询权限）
            QueryWrapper<Permission> permQuery = new QueryWrapper<>();
            permQuery.eq("role_id", role.getId());
            List<Permission> permissions = permissionMapper.selectList(permQuery);
            for (Permission perm : permissions) {
                // 权限直接使用perm_code（如 "user:delete"）
                authorities.add(new SimpleGrantedAuthority(perm.getPI()));
            }
        }

        // 5. 封装为Spring Security的User对象（包含用户名、密码、权限）
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(), // 数据库中需存储BCrypt加密后的密码
                authorities
        );
    }
}