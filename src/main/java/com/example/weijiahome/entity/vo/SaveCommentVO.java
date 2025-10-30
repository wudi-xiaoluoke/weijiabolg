package com.example.weijiahome.entity.vo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SaveCommentVO {
    /**
     * 评论唯一标识
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 文章ID
     */
    private Integer articleId;

    /**
     * 用户ID
     */
    private Integer userId;
    /**
     * 用户姓名
     */
    private String userName;
    /**
     * 用户头像
     */
    private String userAvatar;
    /**
     * 评论内容
     */
    private String content;

    /**
     * 父评论ID（用于回复功能）
     */
    private Integer parentId;

    /**
     * 点赞次数
     */
    private Integer likes;
    /**
     * 该用户是否点赞
     */
    private boolean isliked;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

}
