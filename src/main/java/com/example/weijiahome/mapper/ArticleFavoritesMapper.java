package com.example.weijiahome.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.po.ArticleCategories;
import com.example.weijiahome.entity.po.ArticleFavorites;
import com.example.weijiahome.entity.vo.favorites.UserFavoritesVO;
import com.example.weijiahome.service.impl.ArticleFavoritesServiceImpl;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ArticleFavoritesMapper  extends BaseMapper<ArticleFavorites> {
    IPage<UserFavoritesVO> selectUserFavoritesPage( Page<UserFavoritesVO> page,
                                                    @Param("userId") Integer userId);
    Integer countUserFavorites(@Param("userId") Integer userId); // 新增总数查询方法
}
