package com.example.weijiahome.entity.vo;

import lombok.Data;

import java.util.List;

// 分页响应VO（复用MP的Page结构，仅返回需要的字段）
@Data
public class PageFollowerVO {
    private List<FollowerVO> records; // 粉丝列表数据
    private Long total;               // 总粉丝数
    private Integer page;             // 当前页码
    private Integer pageSize;         // 每页数量
}