package com.example.weijiahome.entity.dto;

import com.example.weijiahome.entity.po.Tags;
import lombok.Data;

import java.util.List;

@Data
public class TagsListDTO {
    private List<String> tags;
}
