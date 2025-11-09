package com.example.weijiahome.controller;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.config.AliyunOssProperties;
import com.example.weijiahome.entity.dto.UsersDTO;
import com.example.weijiahome.entity.po.ArticleLikes;
import com.example.weijiahome.entity.po.Result;
import com.example.weijiahome.entity.po.UserFollow;
import com.example.weijiahome.entity.po.Users;
import com.example.weijiahome.entity.vo.ArticleLikeListVO;
import com.example.weijiahome.entity.vo.ArticleVO;
import com.example.weijiahome.entity.vo.PageFollowerVO;
import com.example.weijiahome.entity.vo.UsersFollowVO;
import com.example.weijiahome.entity.vo.favorites.UserFavoritesVO;
import com.example.weijiahome.service.IUsersService;
import com.example.weijiahome.utils.JwtUtil;
import com.example.weijiahome.utils.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static com.baomidou.mybatisplus.core.toolkit.Wrappers.update;

/**
 * <p>
 * 用户表 前端控制器
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@RestController
@RequestMapping("/api/users")
public class UsersController {
    @Autowired
    private IUsersService usersService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordUtil passwordUtil;
    @Autowired
    private AliyunOssProperties aliyunOssProperties;
    @GetMapping("/me")
    public Result getMe(@RequestHeader("Authorization") String authorization){
        /**
         * 前端传递的是请求头是 `Authorization: Bearer {token}`
         * 所以要对请求数据进行处理 单独拿到token
         */
        // 1. 验证 Authorization 头格式
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Result.error(404,"无效的Token格式，需以 'Bearer ' 开头");
        }

        // 2. 提取 Token（去除 "Bearer " 前缀，共7个字符："Bearer " 包含一个空格）
        String token = authorization.substring(7).trim(); // 额外trim()确保无前后空格

        try {
            // 3. 解析 Token 获取用户ID
            String userId = jwtUtil.getUserIdFromToken(token);
            // 4. 查询用户信息并返回
            return Result.ok(usersService.getById(Integer.parseInt(userId)));
        } catch (Exception e) {
            // 处理 Token 解析失败（如过期、篡改等）
            return Result.error(404,"Token无效或已过期：" + e.getMessage());
        }
    }
    @PutMapping("/me")
    public Result putMe(@RequestBody Users user,
                        @RequestHeader("Authorization") String authorization){
        Integer userId = getuserIdFromToken(authorization);
        if (!user.getId().equals(userId)){
            return Result.error(404,"用户权限不够");
        }
        usersService.updateById(user);

        // 6. 返回更新后的用户信息
        return Result.ok(usersService.getById(userId));
    }
    @PutMapping("/me/password")
    public Result updatePassword(@RequestHeader("Authorization") String authorization,@RequestBody UsersDTO usersDTO){
        Integer userId = getuserIdFromToken(authorization);
        Users user = usersService.getById(userId);
        if (!passwordUtil.matchesPassword(usersDTO.getOldPassword(), user.getPassword())){
            return Result.badRequest("旧密码错误");
        }
        user.setPassword(passwordUtil.encodePassword(usersDTO.getNewPassword()));

        if (!usersService.updateById(user)){
            return Result.badRequest("修改密码失败");
        }

        return Result.ok("密码修改成功");
    }
    @PostMapping("/me/avatar")
    public Result updateAvatar(
            @RequestHeader("Authorization") String authHeader, // Token 鉴权
            @RequestParam("file") MultipartFile file) throws IOException {
        Integer userId = getuserIdFromToken(authHeader);
        //完成上传和存储功能
        String avatarURL = usersService.updateAvatar(userId, file);
        //创建map集合 组合返回数据对象
        Map<String,String> avatar = new HashMap<>();
        avatar.put("avatarUrl",avatarURL);
        return Result.ok(avatarURL);
    }

    /**
     * 提取请求头中的用户id
     * @param authorization
     * @return
     */
    public Integer getuserIdFromToken(String authorization){

        // 提取 Token（去除 "Bearer " 前缀，共7个字符："Bearer " 包含一个空格）
        String token = authorization.substring(7).trim(); // 额外trim()确保无前后空格


            String userId = jwtUtil.getUserIdFromToken(token);
            return Integer.parseInt(userId);
    }
    /**
     * 关注指定Id的用户
     */
    @PostMapping("/{id}/follow")
    public Result<UsersFollowVO> followUser(@RequestHeader("Authorization") String authHeader,
                                            @PathVariable(value = "id")Integer id){
        //获取当前登录的用户id
        Integer userId = getuserIdFromToken(authHeader);
        return Result.ok(usersService.followUser(userId,id));
    }
    /**
     * 取消关注用户
     */
    @PostMapping("/{id}/unfollow")
    public Result<UsersFollowVO> unfollowUser(@RequestHeader("Authorization") String authHeader,
                                              @PathVariable(value = "id")Integer id){
        //获取当前登录的用户id
        Integer userId = getuserIdFromToken(authHeader);
        return Result.ok(usersService.unfollowUser(userId,id));
    }
    /**
     * 获取当前用户对指定ID用户的关注状态
     */
    @GetMapping("/{id}/follow/status")
    public Result<Boolean> followStatus(@RequestHeader("Authorization") String authHeader,
                                        @PathVariable(value = "id")Integer id){
        //获取当前登录的用户id
        Integer userId = getuserIdFromToken(authHeader);
        return Result.ok(usersService.followStatus(id,userId));
    }
    /**
     * 获取指定ID用户的粉丝列表
     */
    @GetMapping("/{id}/followes")
    public Result<PageFollowerVO> followesList(@PathVariable(value = "id")Integer id,
                                               @RequestParam(value = "page",defaultValue = "1")Integer page,
                                               @RequestParam(value = "pageSize",defaultValue = "10")Integer pageSize,
                                               @RequestHeader("Authorization") String authHeader){
        //获取当前登录的用户id
        Integer userId = getuserIdFromToken(authHeader);
        return Result.ok(usersService.followesList(id,page,pageSize,userId));
    }
    /**
     * 获取当前用户的收藏文章列表
     */
    @GetMapping("/favorites")
    public Result<IPage<UserFavoritesVO>> favoritesUser(@RequestHeader("Authorization") String authHeader,
                                                        @RequestParam(value = "page",defaultValue = "1")Integer page,
                                                        @RequestParam(value = "pageSize",defaultValue = "10")Integer pageSize){
        //获取当前登录的用户id
        Integer userId = getuserIdFromToken(authHeader);
        return Result.ok(usersService.favoritesUser(userId,page,pageSize));
    }
    /**
     * 获取当前用户点赞文章列表
     */
    @GetMapping("/likes")
    public Result<IPage<ArticleLikeListVO>> userLikeArticles(@RequestHeader("Authorization") String authHeader,
                                                             @RequestParam(value = "page",defaultValue = "1")Integer page,
                                                             @RequestParam(value = "pageSize",defaultValue = "10")Integer pageSize){
        //获取当前登录的用户id
        Integer userId = getuserIdFromToken(authHeader);
        return Result.ok(usersService.userLikeArticles(userId,page,pageSize));
    }
}
