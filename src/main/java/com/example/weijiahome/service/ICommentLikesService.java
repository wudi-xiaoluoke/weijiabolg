package com.example.weijiahome.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.weijiahome.entity.po.Categories;
import com.example.weijiahome.entity.po.CommentLikes;

public interface ICommentLikesService extends IService<CommentLikes> {
    void saveCommentLikes(Integer userId, Integer commentId);

    void deleteCommentLikes(Integer userId, Integer commentId);
}
