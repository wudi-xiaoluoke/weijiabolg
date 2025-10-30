package com.example.weijiahome.entity.vo;

import lombok.Data;

@Data
public class LikedVO {
    private Integer likes;
    private boolean isLikes;

    public void setIsLiked(boolean liked) {

    }
}
