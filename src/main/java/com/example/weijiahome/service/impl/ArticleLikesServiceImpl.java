package com.example.weijiahome.service.impl;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.weijiahome.entity.po.ArticleLikes;
import com.example.weijiahome.mapper.ArticleLikesMapper;
import com.example.weijiahome.service.IArticleLikesService;
import org.springframework.stereotype.Service;

@Service
public class ArticleLikesServiceImpl extends ServiceImpl<ArticleLikesMapper, ArticleLikes> implements IArticleLikesService {
}
