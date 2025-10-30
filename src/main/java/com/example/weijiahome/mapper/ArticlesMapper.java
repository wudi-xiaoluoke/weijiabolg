package com.example.weijiahome.mapper;

import com.example.weijiahome.entity.dto.GetArticlesDTO;
import com.example.weijiahome.entity.po.Articles;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.weijiahome.entity.vo.ArticleVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 * 文章表 Mapper 接口
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Mapper
public interface ArticlesMapper extends BaseMapper<Articles> {

    List<ArticleVO> getArticles(GetArticlesDTO articlesDTO);
    @Select("select count(*) from blog.articles")
    Integer totalCount();
}
