package com.example.weijiahome.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.entity.po.ArticleCategories;
import com.example.weijiahome.entity.po.ArticleFavorites;
import com.example.weijiahome.entity.vo.FavoriteVO;
import com.example.weijiahome.exception.BusinessException;
import com.example.weijiahome.mapper.ArticleCategoriesMapper;
import com.example.weijiahome.mapper.ArticleFavoritesMapper;
import com.example.weijiahome.service.IArticleCategoriesService;
import com.example.weijiahome.service.IArticleFavoritesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ArticleFavoritesServiceImpl  extends ServiceImpl<ArticleFavoritesMapper, ArticleFavorites> implements IArticleFavoritesService {
    @Autowired
    private ArticleFavoritesMapper articleFavoritesMapper;
    /**
     * 收藏指定id的文章
     * @param id
     * @param userId
     */
    @Override
    public FavoriteVO favoriteArticles(Integer id, Integer userId) {
        ArticleFavorites a =new ArticleFavorites();
        a.setArticleId(id);
        a.setUserId(userId);
        a.setCreatedAt(LocalDateTime.now());
        articleFavoritesMapper.insert(a);
        QueryWrapper qw =new QueryWrapper<>();
        qw.eq("article_id",id);
        Long l = articleFavoritesMapper.selectCount(qw);
        Integer i =l.intValue();

        FavoriteVO FVO =new FavoriteVO();
        FVO.setFavorited(true);
        FVO.setFavoriteCount(i);

        return FVO;
    }

    /**
     * 取消收藏指定ID的文章
     * @param id
     * @param userId
     */
    @Override
    public FavoriteVO notFavoriteArticles(Integer id, Integer userId) {
        QueryWrapper<ArticleFavorites> qw =new QueryWrapper<>();
        qw.eq("user_id",userId)
          .eq("article_id",id);
        ArticleFavorites articleFavorites = articleFavoritesMapper.selectOne(qw);
        //确保文章数据存在
        if (articleFavorites !=null){
            //存在删除文章收藏数据
            articleFavoritesMapper.delete(qw);
            QueryWrapper<ArticleFavorites> countQw = new QueryWrapper<>();
            countQw.eq("article_id", id);
            Long l = articleFavoritesMapper.selectCount(qw);
            Integer i = l.intValue();
            FavoriteVO FVO =new FavoriteVO();
            FVO.setFavorited(false);
            FVO.setFavoriteCount(i);
            return FVO;
        }else {
            throw new BusinessException("文章收藏数据不存在");
        }

    }

    /**
     * 获取当前用户的该文章ID的收藏状态
     * @param id
     * @param userId
     */
    @Override
    public boolean articleFavoriteStatus(Integer id, Integer userId) {
        //判断文章收藏表中是否有该用户和文章数据
        QueryWrapper<ArticleFavorites> qw =new QueryWrapper<>();
        qw.eq("user_id",userId)
                .eq("article_id",id);
        ArticleFavorites articleFavorites = articleFavoritesMapper.selectOne(qw);
        if (articleFavorites != null){
            return true;
        }else {
            return false;
        }
    }
}
