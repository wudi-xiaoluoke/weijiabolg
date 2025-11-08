package com.example.weijiahome.entity.vo;

import lombok.Data;

import java.time.LocalDateTime;
//获取最新评论返回对象
@Data
public class CommentRecentVO {
    private Integer id;
    private String content;
    private LocalDateTime createdAt;
}
