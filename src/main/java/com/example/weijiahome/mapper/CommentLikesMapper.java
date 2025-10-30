package com.example.weijiahome.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.weijiahome.entity.po.CommentLikes;
import com.example.weijiahome.entity.po.Comments;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentLikesMapper extends BaseMapper<CommentLikes> {
}
