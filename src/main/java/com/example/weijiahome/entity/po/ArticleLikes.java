package com.example.weijiahome.entity.po;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ArticleLikes {
    private Integer id;
    private Integer articleId;
    private Integer userId;
    private LocalDateTime createdAt;
}
