package com.example.weijiahome.entity.po;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ArticleFavorites {
    private Integer id;
    private Integer userId;
    private Integer articleId;
    private LocalDateTime createdAt;//收藏时间
}
