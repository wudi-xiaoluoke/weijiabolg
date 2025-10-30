package com.example.weijiahome.entity.vo;

import com.example.weijiahome.entity.po.Categories;
import com.example.weijiahome.entity.po.Tags;
import com.example.weijiahome.entity.po.Users;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArticleVO {

    /**
     * 文章唯一标识
     */
    private Integer id;

    /**
     * 文章标题
     */
    private String title;

    /**
     * 文章摘要
     */
    private String summary;

    /**
     * 浏览次数
     */
    private Integer viewCount;

    /**
     * 评论次数
     */
    private Integer commentCount;

    /**
     * 点赞次数
     */
    private Integer likeCount;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    // 分类信息
    private Categories category;  // 包含id和name
    // 标签列表
    private List<Tags> tags;     // 每个Tag包含id和name
    // 作者信息
    private Users author; //包含用户id、username和avatar
}