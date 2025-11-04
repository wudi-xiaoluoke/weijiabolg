package com.example.weijiahome.service;

import com.example.weijiahome.entity.po.Comments;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.weijiahome.entity.vo.CommentsLikeVO;
import com.example.weijiahome.entity.vo.CommentsListVO;
import com.example.weijiahome.entity.vo.LikeVO;
import com.example.weijiahome.entity.vo.SaveCommentVO;

/**
 * <p>
 * 评论表 服务类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
public interface ICommentsService extends IService<Comments> {

    CommentsListVO getComments(Integer userId,Integer articleId, Integer page, Integer pageSize);

    SaveCommentVO insert(Comments comment);

    void cleanComments(Integer id);

    LikeVO likeComment(Integer id,Integer userId);
}
