package com.example.weijiahome.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.example.weijiahome.entity.po.CommentLikes;
import com.example.weijiahome.entity.po.Comments;
import com.example.weijiahome.entity.po.Users;
import com.example.weijiahome.entity.vo.*;
import com.example.weijiahome.exception.BusinessException;
import com.example.weijiahome.mapper.CommentsMapper;
import com.example.weijiahome.service.ICommentLikesService;
import com.example.weijiahome.service.ICommentsService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.service.IUsersService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 评论表 服务实现类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Service
@Slf4j
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
    public CommentsListVO getComments(Integer userId,Integer articleId, Integer page, Integer pageSize) {
        //分为三步查询
        //先查寻评论表的数据可能会根据文章id查找
        //查找前拼接一下偏移量 公式为 （page-1） *pageSize
        Integer pageNum = (page-1)*pageSize;
        List<Comments> comments = commentsMapper.getComments(articleId, pageNum, pageSize);
       //创建集合接收对象
        List<CommentsLikeVO> commentsListVOs =new ArrayList<>();

        //根据评论表数据获得用户id
        for (Comments comment : comments) {
            //创建评论对象
            CommentsLikeVO commentsLikeVO =new CommentsLikeVO();
            Integer authorId = comment.getUserId();
            //查询出评论着姓名和头像
            Users user = usersService.getById(authorId);
            String username = user.getUsername();
            String avatar = user.getAvatar();


            //在通过用户id查询评论-点赞表，检查出是否存在点赞，若存在则返回true 不存在返回false
            QueryWrapper<CommentLikes> QW = new QueryWrapper<>();
            QW.eq("user_id",userId).eq("comment_id",comment.getId());
            CommentLikes one = commentLikesService.getOne(QW);
            //拼装对象
            BeanUtils.copyProperties(comment,commentsLikeVO);
            commentsLikeVO.setLikes(comment.getLikeCount());
            commentsLikeVO.setCreatedAt(LocalDateTime.now());
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
        //判断登录用户是否已经对该评论点过赞
        QueryWrapper<CommentLikes> qw =new QueryWrapper<>();
        qw.eq("user_id",userId);
        qw.eq("comment_id",id);
        CommentLikes one = commentLikesService.getOne(qw);
        if (one !=null){
            //已经点赞过了，删除评论-点赞表中的记录，并对该评论点赞数减1
            //先删除评论-点赞表中的记录

            commentLikesService.remove(qw);

            //在将该评论点赞数减1
            UpdateWrapper<Comments> commentsQueryWrapper = new UpdateWrapper<>();
            commentsQueryWrapper.eq("id",id)
                    .ge("like_count", 1);
            commentsQueryWrapper.setSql("like_count = like_count - 1");
            commentsMapper.update(null,commentsQueryWrapper);
            Comments comments1 = commentsMapper.selectById(id);
            LikeVO LV =new LikeVO();
            LV.setLikes(comments1.getLikeCount());
            LV.setLiked(false);
            return LV;
        }else {
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

    /**
     * 获取指定iD的评论详情
     * @param id
     * @param userID
     */
    @Override
    public CommentsLikeVO getIDComment(Integer id, Integer userID) {
        CommentsLikeVO CLVO =new CommentsLikeVO();
        Comments comments = commentsMapper.selectById(id);
        //TODO 后续换上MapStruct来进行类的拷贝
        BeanUtils.copyProperties(CLVO,comments);
        QueryWrapper<CommentLikes> qw =new QueryWrapper<>();
        qw.eq("user_id",userID)
                        .eq("comment_id",id);
        CommentLikes one = commentLikesService.getOne(qw);

        if (one !=null){

            CLVO.setIsLiked(true);
        }else {
            CLVO.setIsLiked(false);
        }
        return CLVO;
    }

    /**
     * 更新指定ID的评论
     * @param id
     * @param content
     */
    @Override
    public CommentUpdateVO updateComment(Integer id,String content) {
        // 1. 关键：参数校验（避免无效操作和空指针）
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("评论ID无效（必须大于0）");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("评论内容不能为空");
        }
        String realContent = content.trim(); // 去空格，避免纯空格内容

        // 2. 构建更新条件，执行更新
        LocalDateTime updateTime = LocalDateTime.now(); // 记录更新时间
        UpdateWrapper<Comments> uw = new UpdateWrapper<>();
        uw.eq("id", id)
                .set("content", realContent)
                .set("updated_at", updateTime); // 同步更新时间
        int updateCount = commentsMapper.update(null, uw); // 接收更新行数，可选校验

        // 3. 可选：校验更新是否成功（比如评论已被删除，updateCount=0）
        if (updateCount == 0) {
            throw new BusinessException("更新失败：评论不存在或已被删除");
        }

        // 4. 构建返回 VO（无需查库！用已知字段直接赋值）
        CommentUpdateVO result = new CommentUpdateVO();

        // 方案A：手动 set（字段少的情况，简洁高效，推荐）
        result.setId(id);
        result.setContent(realContent);
        result.setUpdateTime(updateTime);

        return result;
    }

    /**
     * 批量删除评论
     * @param userId
     * @param ids
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int  deleteComments(Integer userId, List<Integer> ids) {
        // 1. 基础校验：用户ID和评论ID列表非空
        if (userId == null) {
            throw new IllegalArgumentException("操作人ID不能为空");
        }
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("删除的评论ID列表不能为空");
        }
        // 去重避免重复删除
        List<Integer> uniqueParentIds = ids.stream().distinct().collect(Collectors.toList());

        // 2. 获取当前用户并校验角色
        Users currentUser = usersService.getById(userId);
        if (currentUser == null) {
            throw new SecurityException("当前用户不存在");
        }
        Integer userRole = currentUser.getRole();
        if (userRole != 1 && userRole != 2) {
            throw new SecurityException("用户角色非法");
        }

        // 3. 权限过滤：普通用户只能删除自己的评论
        List<Integer> accessibleCommentIds =new ArrayList<>();
        if (userRole == 2) { // 普通用户（角色2）
            // 查询当前用户拥有的父评论ID（过滤掉无权删除的）
            accessibleCommentIds = commentsMapper.selectOwnParentCommentIds(userId, uniqueParentIds);
            if (accessibleCommentIds.isEmpty()) {
                throw new SecurityException("无权限删除指定评论（仅能删除自己的评论）");
            }
        } else if (userRole == 1){ // 管理员（角色1）：拥有所有父评论的删除权限
            accessibleCommentIds = uniqueParentIds;
        }

        // 4. 查询所有关联的子评论ID（parentId在可操作的父评论ID中）
        List<Integer> childCommentIds = commentsMapper.selectChildCommentIdsByParentIds(accessibleCommentIds);

        // 5. 合并要删除的所有评论ID（父+子）
        List<Integer> allDeleteIds = new ArrayList<>(accessibleCommentIds);
        allDeleteIds.addAll(childCommentIds);
        if (allDeleteIds.isEmpty()) {
            return 0; // 无评论可删除
        }

        // 6. 执行逻辑删除（假设表中有is_deleted字段，0-未删除，1-已删除）
        int deleteCount = commentsMapper.logicDeleteComments(allDeleteIds);

        // 7. 返回删除总数（父评论数 + 子评论数）
        return deleteCount;
    }

    /**
     * 取消点赞指定ID的评论
     * @param id
     * @param userId
     */
    @Override
    public LikeVO unLikeById(Integer id, Integer userId) {
        //删除文章-点赞表中文章id和用户id相同的数据
        QueryWrapper<CommentLikes> qw =new QueryWrapper<>();
        qw.eq("comment_id",id)
          .eq("user_id",userId);
        boolean remove = commentLikesService.remove(qw);
        LikeVO likeVO =new LikeVO();
        if (remove){
            //删除成功
            //扣减评论表中的like_count字段，并统计like_count
            UpdateWrapper<Comments> UW =new UpdateWrapper<>();
            UW.eq("id",id);
            UW.set("like_count", "IF(like_count > 0, like_count - 1, 0)");
            commentsMapper.update(null,UW);
            // 统计更新后的 like_count
                Comments comment = commentsMapper.selectById(id); // 查更新后的评论
                Integer likes = comment.getLikeCount(); // 获取最新点赞数
                // 拼装返回对象

            likeVO.setLikes(likes);
            likeVO.setLiked(false);
            return likeVO;

        }else {
            log.error("删除失败");
            return likeVO;
        }
    }

    /**
     * 获取评论统计信息
     * @param id 可选参数 如果有代表查询该文章id的评论数据，如果不输入返回全站的评论数据
     */
    @Override
    public CommentsStatsVO statsComments(Integer id) {
        QueryWrapper<Comments> queryWrapper = new QueryWrapper<>();
        //判断是否有文章id
        if (id != null){
            //有文章id
            queryWrapper.eq("id", id);
        }
        // 统计总评论数
        Integer total = Math.toIntExact(commentsMapper.selectCount(queryWrapper));
        // 统计今日新增评论（创建时间 >= 今日0点）
        LocalDateTime todayStart = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        queryWrapper.and(wrapper -> wrapper.ge("create_time", todayStart));
        Integer today = Math.toIntExact(commentsMapper.selectCount(queryWrapper));
        queryWrapper.clear(); // 移除临时的时间条件，避免影响后续查询
        // 统计近7天新增评论（创建时间 >= 7天前0点）
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7).truncatedTo(ChronoUnit.DAYS);
        queryWrapper.and(wrapper -> wrapper.ge("create_time", weekStart));
        Integer week = Math.toIntExact(commentsMapper.selectCount(queryWrapper));
        queryWrapper.clear(); // 移除临时的时间条件
        //统计最近1个月的新增评论
        LocalDateTime monthStart = LocalDateTime.now().minusMonths(1).truncatedTo(ChronoUnit.DAYS);
        queryWrapper.and(Wrapper ->Wrapper.ge("create_time",monthStart));
        Integer month = Math.toIntExact(commentsMapper.selectCount(queryWrapper));
        //拼装返回对象
        CommentsStatsVO commentsStatsVO =new CommentsStatsVO();
        commentsStatsVO.setTotal(total);
        commentsStatsVO.setToday(today);
        commentsStatsVO.setWeek(week);
        commentsStatsVO.setMonth(month);
        return commentsStatsVO;
    }

    /**
     * 获取热门评论
     * @param limit
     * @param articleId
     */
    @Override
    public List<CommentsLikeVO> popularComments(Integer limit, Integer articleId) {
        QueryWrapper<Comments> queryWrapper =new QueryWrapper<>();
        if (articleId !=null){
            //文章id不为空
            //查找该文章的热门评论
            queryWrapper.eq("article_id",articleId);
        }
        //根据点赞数来排序查询热门评论
        queryWrapper.orderByDesc("like_count");
        // 限制返回数量
        queryWrapper.last("LIMIT " + limit);
        //搜索并拼装返回对象
        List<Comments> comments = commentsMapper.selectList(queryWrapper);
        List<CommentsLikeVO> commentsLikeVOList =new ArrayList<>();
        CommentsLikeVO commentsLikeVO =new CommentsLikeVO();
        for (Comments comment : comments) {

            commentsLikeVO.setId(comment.getId());
            commentsLikeVO.setContent(comment.getContent());
            commentsLikeVO.setLikes(comment.getLikeCount());
            commentsLikeVO.setCreatedAt(comment.getCreateTime());

            commentsLikeVOList.add(commentsLikeVO);
        }
        //返回对象
        return commentsLikeVOList;
    }

    /**
     * 获取最新评论
     * @param limit
     * @param articleId
     * @return
     */
    @Override
    public CommentRecentVO recentComments(Integer limit, Integer articleId) {
        QueryWrapper<Comments> queryWrapper =new QueryWrapper<>();
        if (articleId !=null){
            //不为空查询文章的最新评论
            queryWrapper.eq("article_id",articleId);
        }
        //查询最新评论
        queryWrapper.orderByDesc("create_time");
        Comments comment = commentsMapper.selectOne(queryWrapper);
        //拼装返回对象
        CommentRecentVO commentRecentVO =new CommentRecentVO();
        commentRecentVO.setId(comment.getArticleId());
        commentRecentVO.setContent(comment.getContent());
        commentRecentVO.setCreatedAt(comment.getCreateTime());
        return commentRecentVO;
    }

}
