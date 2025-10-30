package com.example.weijiahome.entity.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentsLikeVO {
    private Integer id;             // 评论ID
    private Integer articleId;      // 文章ID
    private Integer userId;         // 用户ID
    private String userName;     // 用户名
    private String userAvatar;   // 用户头像
    private String content;      // 评论内容
    private Integer parentId;       // 父评论ID，null表示顶级评论
    private LocalDateTime createdAt; // 创建时间
    private Integer likes;       // 点赞数
    private Boolean isLiked;     // 当前用户是否已点赞

}
