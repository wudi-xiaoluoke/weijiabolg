package com.example.weijiahome.mapper;

import com.example.weijiahome.entity.po.Comments;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
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

    List<Comments> getComments(  @Param("articleId") Integer articleId,
                                 @Param("pageNum") Integer pageNum,
                                 @Param("pageSize") Integer pageSize);
    @Select("select count(*) from blog.comments")
    Integer count();

    /**
     * 查询普通用户拥有的父评论ID（过滤无权删除的）
     * @param userId
     * @param uniqueParentIds
     * @return
     */
    List<Integer> selectOwnParentCommentIds(Integer userId, List<Integer> uniqueParentIds);
    /**
     * 根据父评论ID查询所有子评论ID
     * @param parentIds 父评论ID列表
     * @return 子评论ID列表
     */
    List<Integer> selectChildCommentIdsByParentIds(@Param("parentIds") List<Integer> parentIds);

    /**
     * 逻辑删除评论（批量）
     * @param commentIds 要删除的评论ID列表（父+子）
     * @return 删除成功的数量
     */
    int logicDeleteComments(@Param("commentIds") List<Integer> commentIds);
}
