package com.example.weijiahome.controller;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.weijiahome.entity.dto.CreatArticlesDTO;
import com.example.weijiahome.entity.dto.GetArticlesDTO;
import com.example.weijiahome.entity.po.*;
import com.example.weijiahome.entity.vo.ArticleVO;
import com.example.weijiahome.entity.po.Result;
import com.example.weijiahome.entity.vo.LikedVO;
import com.example.weijiahome.entity.vo.PageResultVO;
import com.example.weijiahome.service.IArticleCategoriesService;
import com.example.weijiahome.service.IArticleTagsService;
import com.example.weijiahome.service.IArticlesService;
import com.example.weijiahome.service.ICommentLikesService;
import com.example.weijiahome.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>
 * 文章表 前端控制器
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@RestController
@RequestMapping("/api/articles")
public class ArticlesController {
    @Autowired
    private ICommentLikesService commentLikesService;
    @Autowired
    private IArticlesService articlesService;
    @Autowired
    private IArticleCategoriesService articleCategoriesService;
    @Autowired
    private IArticleTagsService articleTagsService;
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 获取文章列表
     * @param articlesDTO
     * @return
     */
    @GetMapping()
    public Result<PageResultVO<ArticleVO>> getArticles(GetArticlesDTO articlesDTO) {
        PageResultVO<ArticleVO> result = articlesService.getArticles(articlesDTO);
        return Result.ok(result);
    }
    //获取文章详情
    @GetMapping("/{id}")
    public Result<Articles> getArticleById(@PathVariable Integer id) {
        Articles article = articlesService.getById(id);
        if (article == null) {
            return Result.error(404,"文章不存在"); // 或返回 404 状态码
        }
        return Result.ok(article);
    }
    // 创建文章
    @PostMapping()
    public Result createArticles(@RequestHeader("Authorization") String authHeader,@RequestBody CreatArticlesDTO articlesDTO) {
        // 1. 验证参数合法性
        if (articlesDTO.getTitle() == null || articlesDTO.getTitle().trim().isEmpty()) {
            return Result.error(404,"文章标题不能为空");
        }
        if (articlesDTO.getContent() == null || articlesDTO.getContent().trim().isEmpty()) {
            return Result.error(404,"文章内容不能为空");
        }
        if (articlesDTO.getCategoryId() == null) {
            return Result.error(404,"文章分类不能为空");
        }
        //根据token获得用户id
        // 提取 Token（去除 "Bearer " 前缀，共7个字符："Bearer " 包含一个空格）
        String token = authHeader.substring(7).trim(); // 额外trim()确保无前后空格

        String userId = jwtUtil.getUserIdFromToken(token);
        int authorId = Integer.parseInt(userId);

        // 2. 保存文章主表信息
        Articles article = new Articles();
        article.setTitle(articlesDTO.getTitle())
                .setContent(articlesDTO.getContent())
                .setAuthorId(authorId);

        boolean isSaved = articlesService.save(article);
        if (!isSaved) {
            return Result.error(404,"文章保存失败");
        }
//        QueryWrapper<Articles> qw =new QueryWrapper<>();
//        qw.eq("author_id",authorId).select("id").ge("create_time", LocalDateTime.now().minusSeconds(30));
//        Articles one = articlesService.getOne(qw);
//        Integer id = one.getId();

        // 3. 处理标签关联（文章-标签是多对多关系）
        List<Integer> tagIds = articlesDTO.getTagIds();
        if (tagIds != null && !tagIds.isEmpty()) {
            List<ArticleTags> articleTagsList = new ArrayList<>();
            for (Integer tagId : tagIds) {
                ArticleTags articleTag = new ArticleTags();
                articleTag.setArticleId(article.getId()) // 使用刚保存的文章ID
                        .setTagId(tagId);
                articleTagsList.add(articleTag);
            }
            // 批量保存文章-标签关联数据
            articleTagsService.saveBatch(articleTagsList);
        }

        // 4. 在这里处理文章与分类的关联
        ArticleCategories AC =new ArticleCategories();
        articlesDTO.getCategoryId();
        AC.setArticleId(article.getId())
                .setCategoryId(articlesDTO.getCategoryId());

        // 保存文章-分类数据
        articleCategoriesService.save(AC);

        System.out.println("文章的id是"+article.getId());
        return Result.ok(article.getId());
    }
    //更新文章
    @PutMapping("/{id}")
    public  Result<Articles> UPdateArticles(@RequestBody CreatArticlesDTO articlesDTO){
        ArticleCategories AC =new ArticleCategories();
        //更新文章数据
        Articles A = new Articles();
        A.setTitle(articlesDTO.getTitle())
                .setContent(articlesDTO.getContent());
        articlesService.saveOrUpdate(A);

        //更新文章-分类关系数据
        AC.setCategoryId(articlesDTO.getCategoryId())
                .setArticleId(A.getId());
        articleCategoriesService.saveOrUpdate(AC);

        //更新文章-标签关系数据
        ArrayList<Integer> tagIds = articlesDTO.getTagIds();
        List<ArticleTags> articleTagsList = new ArrayList<>();
        for (Integer tagId : tagIds) {
            ArticleTags articleTag = new ArticleTags();
            articleTag.setArticleId(A.getId()) // 使用刚保存的文章ID
                    .setTagId(tagId);
            articleTagsList.add(articleTag);
        }

        articleTagsService.saveBatch(articleTagsList);

        return Result.ok(articlesService.getById(A.getId()));
    }
    // 删除文章
    @DeleteMapping("/{id}")
    public  Result DeleteArticles(@PathVariable("id") Integer id){
        articlesService.deleteArticles(id);
        return Result.ok("文章删除成功");
    }

    /**更新指定ID文章的发布状态（发布/取消发布）
     *
     * @param id
     * @param published true表示发布，false表示取消发布
     * @return
     */
    @PutMapping("/{id}/publish-status")
    public Result PublishStatus(@PathVariable("id")Integer id ,@RequestBody boolean published){
        Integer i = articlesService.PublishStatus(id, published);
        if (i == 0){
            return Result.ok("文章取消发布");
        }
        return Result.ok("文章发布成功");
    }
    //更新指定ID文章的点赞状态（点赞/取消点赞）
    @PutMapping("/{id}/like-status")
    public Result<LikedVO> LikeCount(@PathVariable("id")Integer id,
                                     @RequestBody boolean liked,
                                     @RequestHeader ("Authorization") String authorization){
        //获取用户id
        Integer userId = getuserIdFromToken(authorization);
        Integer i = articlesService.LikeCount(id, liked);
        LikedVO likedvo = new LikedVO();
        likedvo.setLikes(i);
        likedvo.setIsLiked(liked);
        if (liked){
            commentLikesService.saveCommentLikes(userId,id);
        }else {
            commentLikesService.deleteCommentLikes(userId,id);
        }
        return Result.ok(likedvo);
    }

    /**
     * 提取请求头中的用户id
     * @param authorization
     * @return
     */
    public Integer getuserIdFromToken(String authorization){

        // 提取 Token（去除 "Bearer " 前缀，共7个字符："Bearer " 包含一个空格）
        String token = authorization.substring(7).trim(); // 额外trim()确保无前后空格


        String userId = jwtUtil.getUserIdFromToken(token);
        return Integer.parseInt(userId);
    }
}
