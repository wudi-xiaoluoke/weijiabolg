package com.example.weijiahome.entity.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.util.ArrayList;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
public class CreatArticlesDTO {
    private String title; //文章标题
    private String content; //文章内容
    private String summary; //文章摘要
    private String coverImage; //封面图(对应数据库cover_image)
    private Integer categoryId; //分类ID
    private ArrayList<Integer> tagIds; //标签ID数组
    private Integer status; //文章状态，0为草稿，1为已发布
}
