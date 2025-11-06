package com.example.weijiahome.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.po.ArticleFavorites;
import com.example.weijiahome.entity.po.Tags;
import com.example.weijiahome.entity.po.UserFollow;
import com.example.weijiahome.entity.vo.FollowerVO;
import com.example.weijiahome.entity.vo.favorites.UserFavoritesVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserFollowMapper extends BaseMapper<UserFollow> {
    @Select("SELECT u.id, u.username, u.avatar " +
            "FROM blog.user_follows  " +
            "LEFT JOIN blog.users u ON user_follows.followee_id = u.id " +
            "WHERE user_follows.followee_id = #{followeeId} " +
            "ORDER BY user_follows.created_at DESC")
    IPage<FollowerVO> selectFollowerPage(Page<FollowerVO> mpPage, @Param("followeeId") Integer id);


}
