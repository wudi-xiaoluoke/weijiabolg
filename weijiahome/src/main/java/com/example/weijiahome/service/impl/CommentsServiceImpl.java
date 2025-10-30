package com.example.weijiahome.service.impl;

import com.example.weijiahome.entity.po.Comments;
import com.example.weijiahome.mapper.CommentsMapper;
import com.example.weijiahome.service.ICommentsService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 评论表 服务实现类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Service
public class CommentsServiceImpl extends ServiceImpl<CommentsMapper, Comments> implements ICommentsService {

}
