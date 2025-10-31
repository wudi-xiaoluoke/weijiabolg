package com.example.weijiahome.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.po.ArticleCategories;

import com.example.weijiahome.entity.po.Categories;
import com.example.weijiahome.mapper.ArticleCategoriesMapper;
import com.example.weijiahome.mapper.ArticlesMapper;
import com.example.weijiahome.mapper.CategoriesMapper;
import com.example.weijiahome.service.IArticleCategoriesService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.service.ICategoriesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 文章分类关联表 服务实现类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Service
public class ArticleCategoriesServiceImpl extends ServiceImpl<ArticleCategoriesMapper, ArticleCategories> implements IArticleCategoriesService {

    @Autowired
    private ArticleCategoriesMapper categoryArticleMapper;
    @Autowired
    private ArticlesMapper articlesMapper;
    @Autowired
    private ICategoriesService categoriesService;

    /**
     * 通过分类ID分页查询关联的文章ID列表
     * @param categoryId 分类ID
     * @param pageNum 页码（从1开始）
     * @param pageSize 每页条数
     * @return 分页后的文章ID列表
     */
    public IPage<Integer> GetCategoriesList(Integer categoryId, Integer pageNum, Integer pageSize) {
        // 1. 构建分页对象（pageNum：页码，pageSize：每页条数）
        Page<ArticleCategories> page = new Page<>(pageNum, pageSize);

        // 2. 构建查询条件：where category_id = ?
        QueryWrapper<ArticleCategories> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("category_id", categoryId); // 条件：分类ID匹配

        // 3. 执行分页查询（会自动拼接 LIMIT 语句）
        IPage<ArticleCategories> resultPage = categoryArticleMapper.selectPage(page, queryWrapper);

        // 4. 从分页结果中提取 articleId 列表（转换为 Integer 类型的分页对象）
        List<Integer> articleIds = resultPage.getRecords().stream()
                .map(ArticleCategories::getArticleId) // 提取文章ID
                .collect(Collectors.toList());

        // 5. 构建返回的分页对象（保留总条数、总页数等分页信息）
        Page<Integer> articleIdPage = new Page<>();
        articleIdPage.setRecords(articleIds); // 当前页的文章ID列表
        articleIdPage.setTotal(resultPage.getTotal()); // 总条数
        articleIdPage.setSize(resultPage.getSize());   // 每页条数
        articleIdPage.setCurrent(resultPage.getCurrent()); // 当前页码
        // 其他分页信息（如总页数）会自动计算

        return articleIdPage;
    }
    //通过文章id查找分类 返回分类对象
    @Override
    public Integer getCategorie(Integer id) {
        Integer categoryId = categoryArticleMapper.selectByArticleId(id);
        if (categoryId ==null){
            return null;
        }else {
            return categoryId;
        }
    }

}
