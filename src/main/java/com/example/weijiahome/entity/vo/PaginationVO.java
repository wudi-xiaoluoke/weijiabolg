package com.example.weijiahome.entity.vo;

import lombok.Data;

/**
 * 分页信息封装类
 */
@Data
public class PaginationVO {
    /**
     * 总记录数
     */
    private Integer total;
    
    /**
     * 当前页码
     */
    private Integer page;
    
    /**
     * 每页大小
     */
    private Integer pageSize;
    
    /**
     * 总页数
     */
    private Integer pages;
}