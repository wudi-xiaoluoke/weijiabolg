package com.example.weijiahome.entity.po;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("comment_likes")
public class CommentLikes {
    private Integer id;
    private Integer userId;
    private Integer commentId;
    private LocalDateTime createdAt;
}
