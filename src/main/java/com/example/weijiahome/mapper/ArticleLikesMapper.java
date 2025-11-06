package com.example.weijiahome.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.weijiahome.entity.po.ArticleLikes;
import com.example.weijiahome.entity.po.Articles;
import com.example.weijiahome.entity.vo.ArticleLikeListVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ArticleLikesMapper extends BaseMapper<ArticleLikes> {
    IPage<ArticleLikeListVO> userLikeArticles(IPage<ArticleLikeListVO> likeListVOIPage, @Param("userId") Integer userId);
}
