package com.example.weijiahome.controller;


import com.example.weijiahome.entity.po.Comments;
import com.example.weijiahome.entity.po.Result;
import com.example.weijiahome.entity.vo.CommentsListVO;
import com.example.weijiahome.entity.vo.LikeVO;
import com.example.weijiahome.entity.vo.SaveCommentVO;
import com.example.weijiahome.service.ICommentsService;
import com.example.weijiahome.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * <p>
 * 评论表 前端控制器
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@RestController
@RequestMapping("/api/comments")
public class CommentsController {
    @Autowired
    private ICommentsService commentsService;
    @Autowired
    private JwtUtil jwtUtil;
    /**
     * 获取评论列表，支持分页和按文章筛选
     * @param articleId
     * @param page
     * @param pageSize
     * @return
     */
    @GetMapping()
    public Result<CommentsListVO> getComments(
            @RequestParam(required = false) Integer articleId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize){
        ;
        return Result.ok(commentsService.getComments(articleId,page,pageSize));
    }
    //创建评论
    @PostMapping
    public Result<SaveCommentVO> saveComent(@RequestBody Comments comment,
                                            @RequestHeader("Authorization") String authorization){
        //解析请求头中的token获得用户id
        Integer userId = getuserIdFromToken(authorization);
        comment.setUserId(userId);
        return  Result.ok(commentsService.insert(comment));
    }
    /**
     * 删除评论
     */
    @DeleteMapping("/{id}")
    public Result cleanComments(@PathVariable("id")Integer id){
        commentsService.cleanComments(id);
        return Result.ok("删除评论成功");
    }

    /**
     * 点赞评论
     */
    @PostMapping("/{id}/like")
    public Result<LikeVO> likeComment(@PathVariable("id")Integer id,
                                      @RequestHeader("Authorization") String authorization){
        Integer userId = getuserIdFromToken(authorization);
        return Result.ok(commentsService.likeComment(id,userId));
    }
    /**
     * 提取请求头中的用户id
     * @param authorization
     * @return
     */
    public Integer getuserIdFromToken(String authorization){

        // 提取 Token（去除 "Bearer " 前缀，共7个字符："Bearer " 包含一个空格）
        String token = authorization.substring(7).trim(); // 额外trim()确保无前后空格


        String userId = jwtUtil.getUserIdFromToken(token);
        return Integer.parseInt(userId);
    }

}
