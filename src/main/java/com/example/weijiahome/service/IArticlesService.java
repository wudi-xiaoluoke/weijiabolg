package com.example.weijiahome.service;

import com.example.weijiahome.entity.dto.CreatArticlesDTO;
import com.example.weijiahome.entity.dto.GetArticlesDTO;
import com.example.weijiahome.entity.po.Articles;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.weijiahome.entity.vo.ArticleShareVO;
import com.example.weijiahome.entity.vo.ArticleVO;
import com.example.weijiahome.entity.vo.PageResultVO;

import java.util.List;

/**
 * <p>
 * 文章表 服务类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
public interface IArticlesService extends IService<Articles> {

    PageResultVO<ArticleVO> getArticles(GetArticlesDTO articlesDTO);

    void deleteArticles(Integer id);

    Integer PublishStatus(Integer id, boolean published);

    Integer LikeCount(Integer id, boolean liked);

    Articles updateArticles(Integer id, CreatArticlesDTO articlesDTO);

    boolean getArticlesLike(Integer id, Integer userId);

    void saveArticlesLikes(Integer userId, Integer id,boolean liked);

    ArticleShareVO articleShare(Integer articleId, String platform);
}
