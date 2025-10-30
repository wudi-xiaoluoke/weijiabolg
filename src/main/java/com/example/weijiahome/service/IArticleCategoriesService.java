package com.example.weijiahome.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.weijiahome.entity.po.ArticleCategories;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.weijiahome.entity.po.Categories;

import java.util.List;

/**
 * <p>
 * 文章分类关联表 服务类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
public interface IArticleCategoriesService extends IService<ArticleCategories> {

    IPage<Integer> GetCategoriesList(Integer id, Integer page, Integer pageSize);

    Categories getCategorie(Integer id);
}
