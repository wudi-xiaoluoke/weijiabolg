package com.example.weijiahome.mapper;

import com.example.weijiahome.entity.po.ArticleCategories;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.weijiahome.entity.po.Categories;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * <p>
 * 文章分类关联表 Mapper 接口
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Mapper
public interface ArticleCategoriesMapper extends BaseMapper<ArticleCategories> {
@Select("select category_id from blog.article_categories where article_id =#{id}")
    Integer selectByArticleId(Integer id);
}
