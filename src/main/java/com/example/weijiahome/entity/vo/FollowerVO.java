package com.example.weijiahome.entity.vo;

import lombok.Data;

@Data
public class FollowerVO {
    private Long id;          // 粉丝ID
    private String username; // 粉丝用户名
    private String avatar;    // 粉丝头像URL
    private Boolean isFollowing; // 当前登录用户是否关注该粉丝
}