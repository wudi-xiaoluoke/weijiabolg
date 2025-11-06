package com.example.weijiahome.entity.po;


import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_follows")
public class UserFollow {
    private Integer id;
    private Integer followerId; // 关注者ID
    private Integer followeeId; // 被关注者ID
    private LocalDateTime createdAt; // 关注时间
}