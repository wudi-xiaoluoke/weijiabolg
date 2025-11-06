package com.example.weijiahome.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.po.ArticleFavorites;
import com.example.weijiahome.entity.po.UserFollow;
import com.example.weijiahome.entity.vo.ArticleLikeListVO;
import com.example.weijiahome.entity.vo.FollowerVO;
import com.example.weijiahome.entity.vo.PageFollowerVO;
import com.example.weijiahome.entity.vo.UsersFollowVO;
import com.example.weijiahome.entity.vo.favorites.UserFavoritesVO;
import com.example.weijiahome.mapper.*;
import com.example.weijiahome.entity.po.Users;

import com.example.weijiahome.service.IArticleFavoritesService;
import com.example.weijiahome.service.IUsersService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.utils.OssUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    @Autowired
    private UserFollowMapper userFollowMapper;
    @Autowired
    private ArticleFavoritesMapper articleFavoritesMapper;
    @Autowired
    private ArticlesMapper articlesMapper;
    @Autowired
    private ArticleLikesMapper articleLikesMapper;

    @Transactional
    @Override
    public String updateAvatar(Integer userId, MultipartFile file) throws IOException {
        String avatarUrl = ossUtil.uploadAvatar(file);
        usersMapper.updateAvatar(userId,avatarUrl);
        return avatarUrl;
    }

    /**
     * 关注指定ID的用户
     * @param userId 当前登录的用户id
     * @param id    关注的用户ID
     */
    @Override
    public UsersFollowVO followUser(Integer userId, Integer id) {
        UserFollow UF =new UserFollow();
        UF.setFollowerId(userId);//当前登录用户ID
        UF.setFolloweeId(id);
        UF.setCreatedAt(LocalDateTime.now());
        userFollowMapper.insert(UF);

        //统计总粉丝数(有多少人关注这个用户)
        QueryWrapper<UserFollow> qw =new QueryWrapper<>();
        qw.eq("followee_id",id);
        Long l = userFollowMapper.selectCount(qw);
        Integer count = l.intValue();

        //组装返回对象
        UsersFollowVO UFVO =new UsersFollowVO();
        UFVO.setFollowing(true);
        UFVO.setFollowerCount(count);
        return UFVO;
    }

    /**
     * 取消关注指定ID的用户
     * @param userId
     * @param id
     */
    @Override
    public UsersFollowVO unfollowUser(Integer userId, Integer id) {
        //删除关注的记录
        QueryWrapper<UserFollow> unFollow =new QueryWrapper<>();
        unFollow.eq("follower_id",userId)
                .eq("followee_id",id);
        userFollowMapper.delete(unFollow);

        //统计总粉丝数(有多少人关注这个用户)
        QueryWrapper<UserFollow> qw =new QueryWrapper<>();
        qw.eq("followee_id",id);
        Long l = userFollowMapper.selectCount(qw);
        Integer count = l.intValue();

        //组装返回对象
        UsersFollowVO UFVO =new UsersFollowVO();
        UFVO.setFollowing(false);
        UFVO.setFollowerCount(count);
        return UFVO;
    }

    /**
     * 获取当前用户对指定id用户的关注状态
     * @param id
     * @param userId 当前用户id
     * @return
     */
    @Override
    public boolean followStatus(Integer id, Integer userId) {
        QueryWrapper<UserFollow> qw =new QueryWrapper<>();
        qw.eq("follower_id",userId)
          .eq("followee_id",id);
        UserFollow userFollow = userFollowMapper.selectOne(qw);
        if (userFollow !=null){
            return true;
        }
        return false;
    }

    /**
     * 获取指定ID用户的分析列表
     * @param id
     * @param page
     * @param pageSize
     * @param userId 当前登录用户的id
     */
    @Override
    public PageFollowerVO followesList(Integer id, Integer page, Integer pageSize,Integer userId) {

        // 2. 初始化分页参数（设置默认值：page=1，pageSize=10）
        if (page == null || page < 1) page = 1;
        if (pageSize == null || pageSize < 1 || pageSize > 50) pageSize = 10; // 限制最大每页50条
        Page<FollowerVO> mpPage = new Page<>(page, pageSize);
        IPage<FollowerVO> followerIPage = userFollowMapper.selectFollowerPage(mpPage, id);

        // 4. 给每个粉丝添加「当前登录用户是否关注该粉丝」的标记
        List<FollowerVO> followerVOList = followerIPage.getRecords().stream()
                .map(followerVO -> {
                    // 查询 currentUserId 是否关注了该粉丝（followerVO.getId() 是粉丝ID）
                    boolean isFollowing = isUserFollowing(userId, followerVO.getId());
                    followerVO.setIsFollowing(isFollowing);
                    return followerVO;
                })
                .collect(Collectors.toList());
        // 5. 封装分页响应结果
        PageFollowerVO pageVO = new PageFollowerVO();
        pageVO.setRecords(followerVOList);
        pageVO.setTotal(followerIPage.getTotal()); // 总粉丝数
        pageVO.setPage(page);
        pageVO.setPageSize(pageSize);

        return pageVO;
    }

    /**
     * 获取当前用户的收藏文章列表
     * @param userId
     * @param page
     * @param pageSize
     */
    @Override
    public IPage<UserFavoritesVO> favoritesUser(Integer userId, Integer page, Integer pageSize) {
        //查找当前用户收藏的文章
        Page<UserFavoritesVO> page1 = new Page<>(page,pageSize);
        IPage<UserFavoritesVO> dataPage = articleFavoritesMapper.selectUserFavoritesPage(page1, userId);
        // 查询总条数
        Integer total = articleFavoritesMapper.countUserFavorites(userId);
        // 手动设置总条数
        dataPage.setTotal(total);
        return dataPage;

    }

    /**
     * 获取当前用户的点赞文章列表
     * @param userId
     * @param page
     * @param pageSize
     */
    @Override
    public IPage<ArticleLikeListVO> userLikeArticles(Integer userId, Integer page, Integer pageSize) {
        Page<ArticleLikeListVO> mpPage = Page.of(page, pageSize);
        //根据当前用户id 查询文章点赞列表，获得文章id集合 通过文章集合查询数据库 获得文章数据
        //同时根据文章id查找文章分类表 获得分类id 查询数据库 得到分类对象的id和name
        return articleLikesMapper.userLikeArticles(mpPage, userId);
    }

    /**
     * 判断A用户是否关注了B用户
     * @param userId A用户（当前登录用户）
     * @param targetUserId B用户（粉丝ID）
     * @return true=已关注，false=未关注
     */
    private boolean isUserFollowing(Integer userId, Long targetUserId) {
        LambdaQueryWrapper<UserFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserFollow::getFollowerId, userId) // A是关注者
                .eq(UserFollow::getFolloweeId, targetUserId); // B是被关注者
        return userFollowMapper.exists(wrapper);
    }
}
