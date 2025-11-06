package com.example.weijiahome.mapper;

import com.example.weijiahome.entity.po.Tags;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 * 标签表 Mapper 接口
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Mapper
public interface TagsMapper extends BaseMapper<Tags> {

    List<Tags> getPopular(Integer limit);
    @Select("select * from blog.tags ")
    List<Tags> getTags();
}
