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
    private Integer categoryId; //分类ID
    private ArrayList<Integer> tagIds; //标签ID数组

}
