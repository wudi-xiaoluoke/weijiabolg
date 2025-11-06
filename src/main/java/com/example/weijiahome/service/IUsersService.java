package com.example.weijiahome.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.weijiahome.entity.po.Users;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.weijiahome.entity.vo.ArticleLikeListVO;
import com.example.weijiahome.entity.vo.PageFollowerVO;
import com.example.weijiahome.entity.vo.UsersFollowVO;
import com.example.weijiahome.entity.vo.favorites.UserFavoritesVO;
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

    UsersFollowVO followUser(Integer userId, Integer id);

    UsersFollowVO unfollowUser(Integer userId, Integer id);

    boolean followStatus(Integer id, Integer userId);

    PageFollowerVO followesList(Integer id, Integer page, Integer pageSize, Integer userId);

    IPage<UserFavoritesVO> favoritesUser(Integer userId, Integer page, Integer pageSize);

    IPage<ArticleLikeListVO> userLikeArticles(Integer userId, Integer page, Integer pageSize);
}
