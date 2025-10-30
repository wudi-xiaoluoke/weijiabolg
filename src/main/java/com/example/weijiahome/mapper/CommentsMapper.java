package com.example.weijiahome.mapper;

import com.example.weijiahome.entity.po.Comments;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * <p>
 * 评论表 Mapper 接口
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Mapper
public interface CommentsMapper extends BaseMapper<Comments> {

    List<Comments> getComments(Integer articleId, Integer page, Integer pageSize);
    @Select("select count(*) from blog.comments")
    Integer count();
}
