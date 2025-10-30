package com.example.weijiahome.entity.vo;

import lombok.Data;

import java.util.List;

@Data
public class CommentsListVO {
    private List<CommentsLikeVO> commentsLikeVOs;
    private Integer total;
    private Integer page;
    private Integer pageSize;
}
