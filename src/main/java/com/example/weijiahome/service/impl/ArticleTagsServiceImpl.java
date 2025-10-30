package com.example.weijiahome.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.po.Tags;
import com.example.weijiahome.mapper.ArticleTagsMapper;
import com.example.weijiahome.entity.po.ArticleTags;

import com.example.weijiahome.service.IArticleTagsService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.service.ITagsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 文章标签关联表 服务实现类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Service
public class ArticleTagsServiceImpl extends ServiceImpl<ArticleTagsMapper, ArticleTags> implements IArticleTagsService {
    @Autowired
    private ArticleTagsMapper articleTagsMapper;
    @Autowired
    private ITagsService tagsService;
    @Override
    public Page<Integer> getArticles(Integer id, Integer page, Integer pageSize) {
        //构建分页对象
        Page<ArticleTags> page1 =new Page<>(page,pageSize);
        //构建查询条件
        QueryWrapper<ArticleTags> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("tags_id",id);//条件:标签id
        //执行分页查询
        Page<ArticleTags> articleTagsPage = articleTagsMapper.selectPage(page1, queryWrapper);
        //从分页结果中提取 articleId列表
        List<Integer> articleIds = articleTagsPage.getRecords().stream()
                .map(ArticleTags::getArticleId)
                .collect(Collectors.toList());

        //构建返回的分页对象
        Page<Integer> articlesIdPage = new Page<>();
        articlesIdPage.setRecords(articleIds);//当前页的文章ID列表
        articlesIdPage.setTotal(articleTagsPage.getTotal());//总条数
        articlesIdPage.setSize(articleTagsPage.getSize());//每页条数
        articlesIdPage.setCurrent(articleTagsPage.getCurrent());//当前页码

        return articlesIdPage;
    }
    //根据文章id查看 标签得到标签对象的集合
    @Override
    public List<Tags> getTags(Integer id) {
        List<Tags> tags = new ArrayList<>();
        QueryWrapper<ArticleTags> qw =new QueryWrapper<>();
        qw.eq("article_id",id);
        List<ArticleTags> articleTags = articleTagsMapper.selectList(qw);
        for (ArticleTags articleTag : articleTags) {
            Integer tagId = articleTag.getTagId();
            Tags byId = tagsService.getById(tagId);
            tags.add(byId);
        }

        return tags;
    }
}
