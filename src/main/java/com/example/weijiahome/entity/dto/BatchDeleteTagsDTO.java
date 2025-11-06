package com.example.weijiahome.entity.dto;

import lombok.Data;

import java.util.List;

@Data
public class BatchDeleteTagsDTO {
    private List<Integer> ids;
}