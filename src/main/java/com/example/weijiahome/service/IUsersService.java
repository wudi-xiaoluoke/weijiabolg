package com.example.weijiahome.service;

import com.example.weijiahome.entity.po.Users;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * <p>
 * 用户表 服务类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
public interface IUsersService extends IService<Users> {

    String updateAvatar(Integer userId, MultipartFile file) throws IOException;
}
