package com.example.weijiahome.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.entity.po.UserFollow;
import com.example.weijiahome.mapper.UserFollowMapper;
import com.example.weijiahome.service.IUserFollowService;
import org.springframework.stereotype.Service;

@Service
public class UserFollowServiceImpl extends ServiceImpl<UserFollowMapper, UserFollow> implements IUserFollowService {
}
