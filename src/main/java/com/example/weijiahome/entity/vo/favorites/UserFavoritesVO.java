package com.example.weijiahome.entity.vo.favorites;

import lombok.Data;

import java.time.LocalDateTime;


@Data
public class UserFavoritesVO {
    private Integer id;          // 收藏记录ID
    private String title;     // 文章标题
    private String summary;   // 文章摘要
    private Integer views;    // 阅读量
    private Integer likes;    // 点赞数
    private LocalDateTime createdAt; // 文章创建时间
    private CategoryVO category; // 分类嵌套对象
}

