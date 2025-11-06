package com.example.weijiahome.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.weijiahome.entity.po.ArticleCategories;
import com.example.weijiahome.entity.po.ArticleFavorites;
import com.example.weijiahome.entity.vo.FavoriteVO;

public interface IArticleFavoritesService  extends IService<ArticleFavorites> {

    FavoriteVO favoriteArticles(Integer id, Integer userId);

    FavoriteVO notFavoriteArticles(Integer id, Integer userId);

    boolean articleFavoriteStatus(Integer id, Integer userId);
}
