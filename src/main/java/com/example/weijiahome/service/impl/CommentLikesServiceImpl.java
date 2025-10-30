package com.example.weijiahome.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.entity.po.CommentLikes;
import com.example.weijiahome.mapper.CommentLikesMapper;
import com.example.weijiahome.service.ICommentLikesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CommentLikesServiceImpl extends ServiceImpl<CommentLikesMapper,CommentLikes> implements ICommentLikesService {
    @Autowired
    private CommentLikesMapper commentLikesMapper;
    //点赞后向文章-点赞表添加数据
    @Override
    public void saveCommentLikes(Integer userId, Integer commentId) {
        CommentLikes Cl = new CommentLikes();
        Cl.setUserId(userId);
        Cl.setCommentId(commentId);
        Cl.setCreatedAt(LocalDateTime.now());
        commentLikesMapper.insert(Cl);
    }
    //取消点赞后向文章-点赞删除该记录
    @Override
    @Transactional
    public void deleteCommentLikes(Integer userId, Integer commentId) {
        QueryWrapper<CommentLikes> qw =new QueryWrapper<>();
        qw.eq("user_id",userId);
        qw.eq("comment_id",commentId);
        commentLikesMapper.delete(qw);
    }
}
