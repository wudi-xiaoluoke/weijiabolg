package com.example.weijiahome.entity.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentUpdateVO {
    private Integer id;
    private String content;
    private LocalDateTime updateTime;
}
