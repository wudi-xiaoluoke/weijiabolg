package com.example.weijiahome.entity.dto;

import lombok.Data;

@Data
public class TagValidateDTO {
    private String name;    // 标签名称（必填）
    private Integer id;     // ID（可选，用于更新时排除自身）
}
