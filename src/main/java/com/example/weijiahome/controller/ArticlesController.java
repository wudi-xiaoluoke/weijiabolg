package com.example.weijiahome.controller;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.weijiahome.entity.dto.CreatArticlesDTO;
import com.example.weijiahome.entity.dto.GetArticlesDTO;
import com.example.weijiahome.entity.po.*;
import com.example.weijiahome.entity.vo.*;
import com.example.weijiahome.entity.po.Result;
import com.example.weijiahome.mapper.UsersMapper;
import com.example.weijiahome.service.*;
import com.example.weijiahome.utils.JwtUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private ICategoriesService categoriesService;
    @Autowired
    private UsersMapper usersMapper;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private IArticleLikesService articleLikesService;
    @Autowired
    private IArticleFavoritesService articleFavoritesService;

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
    public Result<ArticleVO> getArticleById(@PathVariable Integer id) {
        Articles article = articlesService.getById(id);
        if (article == null) {
            return Result.error(404,"文章不存在"); // 或返回 404 状态码
        }
        
        // 转换为VO对象
        ArticleVO articleVO = new ArticleVO();
        BeanUtils.copyProperties(article, articleVO);
        
        // 设置作者信息
        if (article.getAuthorId() != null) {
            Users author = usersMapper.selectById(article.getAuthorId());
            articleVO.setAuthor(author);
        }
        
        // 设置分类信息
        Integer categoryId = articleCategoriesService.getCategorie(id);
        if (categoryId != null) {
            Categories category = categoriesService.getById(categoryId);
            articleVO.setCategory(category);
        }
        
        // 设置标签信息
        List<Tags> tags = articleTagsService.getTags(id);
        articleVO.setTags(tags);
        
        return Result.ok(articleVO);
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
    public  Result<Articles> updateArticles(@PathVariable("id") Integer id, @RequestBody CreatArticlesDTO articlesDTO){
        ArticleCategories AC =new ArticleCategories();
        //更新文章数据

        Articles A = articlesService.updateArticles(id, articlesDTO);

        //更新文章-分类关系数据
        AC.setCategoryId(articlesDTO.getCategoryId())
                .setArticleId(id); // 使用传入的文章ID
        articleCategoriesService.saveOrUpdate(AC);

        //更新文章-标签关系数据
        ArrayList<Integer> tagIds = articlesDTO.getTagIds();
        List<ArticleTags> articleTagsList = new ArrayList<>();
        for (Integer tagId : tagIds) {
            ArticleTags articleTag = new ArticleTags();
            articleTag.setArticleId(id) // 使用传入的文章ID
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
        //执行更改点赞状态
        Integer i = articlesService.LikeCount(id, liked);
        LikedVO likedvo = new LikedVO();
        likedvo.setLikes(i);
        likedvo.setIsLiked(liked);
        //在用户的文章点赞表中进行增减
        articlesService.saveArticlesLikes(userId,id,liked);
        //返回文章的点赞结果
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
    /**
     * 获取指定Id文章的当前用户点赞状态
     */
    @GetMapping("/{id}/like/status")
    public  Result getArticlesLike(@PathVariable(value = "id")Integer id,
                                   @RequestHeader ("Authorization") String authorization){
        //获取用户id
        Integer userId = getuserIdFromToken(authorization);

        return Result.ok(articlesService.getArticlesLike(id,userId));
    }
    /**
     *收藏指定ID的文章
     */
    @PostMapping("/{id}/favorite")
    public Result<FavoriteVO> favoriteArticles(@PathVariable(value = "id")Integer id,
                                               @RequestHeader ("Authorization") String authorization){
        //获取用户id
        Integer userId = getuserIdFromToken(authorization);
        return Result.ok(articleFavoritesService.favoriteArticles(id,userId));
    }
    /**
     * 取消收藏指定Id的文章
     */
    @PostMapping("/{id}/unfavorite")
    public Result<FavoriteVO> notFavoriteArticles(@PathVariable(value = "id")Integer id,
                                                  @RequestHeader ("Authorization") String authorization){
        //获取用户Id
        Integer userId = getuserIdFromToken(authorization);
        return Result.ok(articleFavoritesService.notFavoriteArticles(id,userId));
    }
    /**
     * 获取指定的ID文章的当前用户收藏状态
     */
    @GetMapping("/{id}/favorite/status")
    public Result articleFavoriteStatus(@PathVariable(value = "id")Integer id,
                                        @RequestHeader ("Authorization") String authorization){
        //获取用户ID
        Integer userId = getuserIdFromToken(authorization);
        return Result.ok(articleFavoritesService.articleFavoriteStatus(id,userId));
    }
    /**
     *分享文章
     */
    @PostMapping("/share")
    public Result<ArticleShareVO> articleShare(@RequestBody Map<String, Object> requestBody){
        Integer articleId = (Integer) requestBody.get("articleId");
        String platform = (String) requestBody.get("platform");
        return Result.ok(articlesService.articleShare(articleId, platform));
    }
}
