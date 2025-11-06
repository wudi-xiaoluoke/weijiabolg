package com.example.weijiahome.entity.vo;

import com.example.weijiahome.entity.po.Categories;
import com.example.weijiahome.entity.po.Tags;
import com.example.weijiahome.entity.po.Users;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArticleLikeListVO {
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
     * 点赞次数
     */
    private Integer likeCount;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    // 分类信息
    private CategoryVO category;  // 包含id和name
}
