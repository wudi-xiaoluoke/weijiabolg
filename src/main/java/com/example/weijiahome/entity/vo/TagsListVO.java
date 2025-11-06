package com.example.weijiahome.entity.vo;

import com.example.weijiahome.entity.po.Tags;
import lombok.Data;

import java.util.List;

@Data
public class TagsListVO {
    private List<Tags> created;//新创建的标签
    private List<Tags> alreadyExists;//已经存在的标签
}
