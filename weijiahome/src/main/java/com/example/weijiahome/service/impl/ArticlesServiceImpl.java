package com.example.weijiahome.service.impl;

import com.example.weijiahome.entity.po.Articles;
import com.example.weijiahome.mapper.ArticlesMapper;
import com.example.weijiahome.service.IArticlesService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 文章表 服务实现类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Service
public class ArticlesServiceImpl extends ServiceImpl<ArticlesMapper, Articles> implements IArticlesService {

}
