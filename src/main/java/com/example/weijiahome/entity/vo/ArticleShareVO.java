package com.example.weijiahome.entity.vo;

import lombok.Data;

@Data
public class ArticleShareVO {
    private String shareUrl; // 生成的分享链接
    private Integer shareCount; // 该文章的总分享次数
}