package com.example.weijiahome.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.dto.CreatArticlesDTO;
import com.example.weijiahome.entity.dto.GetArticlesDTO;
import com.example.weijiahome.entity.po.*;
import com.example.weijiahome.entity.vo.ArticleVO;
import com.example.weijiahome.entity.vo.PageResultVO;
import com.example.weijiahome.entity.vo.PaginationVO;
import com.example.weijiahome.mapper.*;
import com.example.weijiahome.service.IArticleCategoriesService;
import com.example.weijiahome.service.IArticleTagsService;
import com.example.weijiahome.service.IArticlesService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.service.ICategoriesService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 文章表 服务实现类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Service
public class ArticlesServiceImpl extends ServiceImpl<ArticlesMapper, Articles> implements IArticlesService {
    @Autowired
    private ArticlesMapper articlesMapper;
    @Autowired
    private ArticleTagsMapper articleTagsMapper;
    @Autowired
    private TagsMapper tagsMapper;
    @Autowired
    private ArticleCategoriesMapper articleCategoriesMapper;
    @Autowired
    private CategoriesMapper categorieMapper;
    @Autowired
    private IArticleCategoriesService articleCategoriesService;
    @Autowired
    private IArticleTagsService articleTagsService;
    @Autowired
    private ICategoriesService categoriesService;
    /**
     * 根据条件查询文章
     * @param articlesDTO
     * @return
     */
    @Override
    public PageResultVO<ArticleVO> getArticles(GetArticlesDTO articlesDTO) {
        //先获得条件筛选后的数据
        //计算offset
        Integer page = articlesDTO.getPage();
        Integer pageSize = articlesDTO.getPageSize();
        articlesDTO.setOffset((page - 1) * pageSize);
        List<ArticleVO> articles = articlesMapper.getArticles(articlesDTO);
        //拼接分类信息和标签信息
        for (ArticleVO article : articles) {
            //拿到文章id
            Integer id = article.getId();
            //通过文章id 查找 文章-分类表 文章-标签表
            Integer categorieId = articleCategoriesService.getCategorie(id);

            List<Tags> tags = articleTagsService.getTags(id);
            Categories categorie = null;
            article.setTags(tags);
            //判断分类id是否为空
            if (categorieId != null){
                categorie = categoriesService.getById(categorieId);

                if (categorie ==null){
                    System.out.println("分类Id："+categorieId+"不存在");
                }
            }
            article.setCategory(categorie);
        }

        // 计算总记录数
        Integer total = articlesMapper.totalCount();
        Integer pages = (total + pageSize - 1) / pageSize;

        // 创建分页信息对象
        PaginationVO paginationVO = new PaginationVO();
        paginationVO.setTotal(total);
        paginationVO.setPage(page);
        paginationVO.setPageSize(pageSize);
        paginationVO.setPages(pages);
        
        // 创建结果对象
        PageResultVO<ArticleVO> pageResultVO = new PageResultVO<>();
        pageResultVO.setRecords(articles);
        pageResultVO.setPagination(paginationVO);
        
        return pageResultVO;
    }
    //删除文章
    @Override
    @Transactional
    public void deleteArticles(Integer id) {
        //删除文章表的数据
        articlesMapper.deleteById(id);
        //构造条件
        QueryWrapper<ArticleCategories> qw =new QueryWrapper();
        QueryWrapper<ArticleCategories> articleId = qw.eq("article_id", id);
        //删除文章-分类表中的文章数据
        articleCategoriesMapper.delete(articleId);

        //构造条件
        QueryWrapper<ArticleTags> qwAT =new QueryWrapper<>();
        QueryWrapper<ArticleTags> articleId1 = qwAT.eq("article_id", id);
        //删除文章-标签表中的文章数据
        articleTagsMapper.delete(articleId1);

    }
    //更新文章的发布状态
    @Override
    public Integer PublishStatus(Integer id, boolean published) {
        //构造条件
        UpdateWrapper<Articles> uw =new UpdateWrapper<>();
        uw.eq("id",id);
        if (published == true){
            uw.set("status",1);
        }else {
            uw.set("status",0);
        }
        articlesMapper.update(null, uw);
        Articles articles = articlesMapper.selectById(id);
        return articles.getStatus();
    }

    /**
     *更新文章点赞状态
     * @param id
     * @param liked true表示点赞，false表示取消点赞
     */
    @Override
    @Transactional
    public Integer LikeCount(Integer id, boolean liked) {
        UpdateWrapper<Articles> UW =new UpdateWrapper<>();
        UW.eq("id",id);
        if (liked == true){
            UW.setSql("like_count = like_count + 1");
        }else {
            UW.setSql("like_count = like_count - 1");
        }
        articlesMapper.update(null,UW);
        Articles articles = articlesMapper.selectById(id);
        return articles.getLikeCount();
    }

    /**
     * 更新文章
     * @param id 文章id
     * @param articlesDTO 前端传递的修改后的文章对象
     * @return
     */
    @Override
    public Articles updateArticles(Integer id, CreatArticlesDTO articlesDTO) {
        // 1. 参数校验：确保ID和DTO不为空
        if (id == null || articlesDTO == null) {
            throw new IllegalArgumentException("文章ID和更新数据不能为空");
        }

        // 2. 创建更新条件：根据ID定位要更新的文章
        UpdateWrapper<Articles> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", id); // 条件：id = 传入的id

        // 3. 将DTO转换为实体类（如果需要更新的字段在DTO中，需映射到实体）
        Articles articles = new Articles();
        BeanUtils.copyProperties(articlesDTO, articles); // 复制DTO中的字段到实体

        // 4. 执行更新操作（根据条件更新，只更新非空字段）
        // 注意：如果DTO中有null字段，不会更新到数据库（保留原数据）
        int rows = articlesMapper.update(articles, updateWrapper);

        // 5. 校验更新结果
        if (rows <= 0) {
            throw new RuntimeException("更新失败，未找到ID为" + id + "的文章或数据未变化");
        }

        // 6. 返回更新后的文章（重新查询一次数据库获取最新数据）
        return articlesMapper.selectById(id);
    }
}