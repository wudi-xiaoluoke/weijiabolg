package com.example.weijiahome.entity.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
public class GetArticlesDTO {
    /**
     * 页码
     */
    private Integer page = 1; // 默认第一页
    /**
     * 每页数量（可选，默认10）
     */
    private Integer pageSize = 10; // 默认每页10条
    /**
     * 关键词搜索（可选）
     */
    private String keyword;
    /**
     * 分类ID（可选）
     */
    private Integer categoryId;
    /**
     * 标签id(可选)
     */
    private Integer tagId;
    /**
     * 排序方式
     */
    private String sort;
    /**
     * 排序顺序
     */
    private String order;
    private Integer offset;
}