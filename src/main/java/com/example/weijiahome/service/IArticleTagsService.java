package com.example.weijiahome.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.po.ArticleTags;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.weijiahome.entity.po.Tags;

import java.util.List;

/**
 * <p>
 * 文章标签关联表 服务类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
public interface IArticleTagsService extends IService<ArticleTags> {

    Page<Integer> getArticles(Integer id, Integer page, Integer pageSize);

    List<Tags> getTags(Integer id);
}
