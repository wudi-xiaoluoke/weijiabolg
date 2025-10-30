package com.example.weijiahome.service.impl;

import com.example.weijiahome.entity.po.Users;
import com.example.weijiahome.mapper.UsersMapper;
import com.example.weijiahome.service.IUsersService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

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

}
