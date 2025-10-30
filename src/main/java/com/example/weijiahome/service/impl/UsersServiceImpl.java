package com.example.weijiahome.service.impl;

import com.example.weijiahome.mapper.UsersMapper;
import com.example.weijiahome.entity.po.Users;

import com.example.weijiahome.service.IUsersService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.utils.OssUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * <p>
 * 用户表 服务实现类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Service
public class UsersServiceImpl extends ServiceImpl<UsersMapper, Users> implements IUsersService {
    @Autowired
    private OssUtil ossUtil;
    @Autowired
    private UsersMapper usersMapper;
    @Transactional
    @Override
    public String updateAvatar(Integer userId, MultipartFile file) throws IOException {
        String avatarUrl = ossUtil.uploadAvatar(file);
        usersMapper.updateAvatar(userId,avatarUrl);
        return avatarUrl;
    }
}
