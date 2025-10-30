package com.example.weijiahome.entity.vo;

import lombok.Data;

import java.util.List;

@Data
public class PageResultVO<T> {
    private List<T> records;    // 数据列表
    private PaginationVO pagination; // 分页信息
}
