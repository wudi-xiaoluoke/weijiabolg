package com.example.weijiahome.service;

import com.example.weijiahome.entity.po.Comments;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.weijiahome.entity.vo.*;

import java.util.List;

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

    CommentsLikeVO getIDComment(Integer id, Integer userID);

    CommentUpdateVO updateComment(Integer id, String content);

    int  deleteComments(Integer userId, List<Integer> ids);

    LikeVO unLikeById(Integer id, Integer userId);

    CommentsStatsVO statsComments(Integer id);

    List<CommentsLikeVO> popularComments(Integer limit, Integer articleId);

    CommentRecentVO recentComments(Integer limit, Integer articleId);
}
