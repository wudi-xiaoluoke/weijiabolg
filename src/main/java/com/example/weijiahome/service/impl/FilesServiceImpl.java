package com.example.weijiahome.service.impl;

import com.example.weijiahome.mapper.FilesMapper;
import com.example.weijiahome.entity.po.Files;

import com.example.weijiahome.service.IFilesService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 文件信息表 服务实现类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Service
public class FilesServiceImpl extends ServiceImpl<FilesMapper, Files> implements IFilesService {

}
