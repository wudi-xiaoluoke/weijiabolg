package com.example.weijiahome.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.example.weijiahome.entity.po.CommentLikes;
import com.example.weijiahome.entity.po.Comments;
import com.example.weijiahome.entity.po.Users;
import com.example.weijiahome.entity.vo.CommentsLikeVO;
import com.example.weijiahome.entity.vo.CommentsListVO;
import com.example.weijiahome.entity.vo.LikeVO;
import com.example.weijiahome.entity.vo.SaveCommentVO;
import com.example.weijiahome.mapper.CommentsMapper;
import com.example.weijiahome.service.ICommentLikesService;
import com.example.weijiahome.service.ICommentsService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.service.IUsersService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
   @Autowired
   private CommentsMapper commentsMapper;
   @Autowired
   private IUsersService usersService;
   @Autowired
   private ICommentLikesService commentLikesService;
    /**
     * 查看评论列表
     * @param articleId
     * @param page
     * @param pageSize
     */
    @Override
    public CommentsListVO getComments(Integer articleId, Integer page, Integer pageSize) {
        //分为三步查询
        //先查寻评论表的数据可能会根据文章id查找
        //查找前拼接一下偏移量 公式为 （page-1） *pageSize
        Integer pageNum = (page-1)*pageSize;
        List<Comments> comments = commentsMapper.getComments(articleId, pageNum, pageSize);
       //创建集合接收对象
        List<CommentsLikeVO> commentsListVOs =new ArrayList<>();
        CommentsLikeVO commentsLikeVO =new CommentsLikeVO();
        //根据评论表数据获得用户id
        for (Comments comment : comments) {
            Integer userId = comment.getUserId();
            //查询出用户姓名和头像
            Users user = usersService.getById(userId);
            String username = user.getUsername();
            String avatar = user.getAvatar();


            //在通过用户id查询评论-点赞表，检查出是否存在点赞，若存在则返回true 不存在返回false
            QueryWrapper<CommentLikes> QW = new QueryWrapper<>();
            QW.eq("user_id",userId);
            CommentLikes one = commentLikesService.getOne(QW);
            //拼装对象
            BeanUtils.copyProperties(comment,commentsLikeVO);

            commentsLikeVO.setUserName(username);
            commentsLikeVO.setUserAvatar(avatar);
            if (one == null){
                //如果该用户没赞过搜索应为空 则设置为false
                commentsLikeVO.setIsLiked(false);
            }else {
                commentsLikeVO.setIsLiked(true);
            }
            //将拼装好的对象加入集合
            commentsListVOs.add(commentsLikeVO);
        }
        //之后将集合与页面page、pageSize、total 拼装成对象返回

        CommentsListVO CLVO = new CommentsListVO();
        CLVO.setCommentsLikeVOs(commentsListVOs);
        //计数查找评论表 得出total
        Integer total = commentsMapper.count();
        CLVO.setTotal(total);
        CLVO.setPage(page);
        CLVO.setPageSize(pageSize);

        return CLVO;





    }

    /**
     * 创建评论
     * @param comment 类中目前数据有 文章id 评论内容 用户id 父评论id
     */
    @Override
    public SaveCommentVO insert(Comments comment) {
        // 设置创建时间和默认点赞数
        comment.setCreateTime(LocalDateTime.now());
        if (comment.getLikeCount() == null) {
            comment.setLikeCount(0);
        }
        comment.setIsdelete(0); // 设置未删除标记
        
        // 执行保存操作到数据库
        commentsMapper.insert(comment);
        
        SaveCommentVO SC = new SaveCommentVO();
        Integer articleId = comment.getArticleId();
        Integer id = comment.getId(); // 保存后会自动生成id
        String content = comment.getContent();
        Integer parentId = comment.getParentId();
        Integer likes = comment.getLikeCount();
        //获取用户id
        Integer userId = comment.getUserId();
        //通过用户id查询用户姓名和头像
        Users user = usersService.getById(userId);
        String username = user.getUsername();
        String avatar = user.getAvatar();
        //拼装返回对象
        SC.setId(id);
        SC.setArticleId(articleId);
        SC.setUserId(userId);
        SC.setUserName(username);
        SC.setUserAvatar(avatar);
        SC.setContent(content);
        SC.setParentId(parentId);
        SC.setCreateTime(comment.getCreateTime());
        SC.setLikes(likes);
        SC.setIsliked(false);
        //返回对象
        return SC;
    }
    /**
     * 删除评论
     */
    @Override
    public void cleanComments(Integer id) {
        UpdateWrapper UW =new UpdateWrapper<>();
        UW.eq("id",id);
        UW.setSql("isdelete = 1");
        commentsMapper.delete(UW);
    }

    /**
     * 点赞评论
     * @param id
     * @return
     */
    @Override
    public LikeVO likeComment(Integer id,Integer userId) {
        //根据评论id对点赞数加一
        UpdateWrapper<Comments> UW =new UpdateWrapper<>();
        UW.eq("id",id);
        UW.setSql("like_count = like_count +1");
        commentsMapper.update(null,UW);
        Comments comment = commentsMapper.selectById(id);
        //根据用户id创建点赞-评论表数据
        CommentLikes CL =new CommentLikes();
        CL.setUserId(userId);
        CL.setCommentId(id);
        CL.setCreatedAt(LocalDateTime.now());
        commentLikesService.save(CL);
        //组装对象返回
        LikeVO LV =new LikeVO();
        LV.setLikes(comment.getLikeCount());
        LV.setLiked(true);
        return LV;
    }


}
