package com.example.weijiahome.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.dto.BatchDeleteTagsDTO;
import com.example.weijiahome.entity.dto.TagValidateDTO;
import com.example.weijiahome.entity.dto.TagsListDTO;
import com.example.weijiahome.entity.po.Tags;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.weijiahome.entity.vo.TagsCountVO;
import com.example.weijiahome.entity.vo.TagsListVO;

import java.util.List;

/**
 * <p>
 * 标签表 服务类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
public interface ITagsService extends IService<Tags> {

    Page<Tags> getTages(Integer page, Integer pageSize);

    List<Tags> getPopular(Integer limit);

    TagsListVO listSaveTags(TagsListDTO tagsListDTO);

    Integer listDeletTags(BatchDeleteTagsDTO batchDeleteTagsDTO);

    Page<Tags> SearchTags(String keyword, Integer page, Integer pageSize);

    TagsCountVO statsTags();

    boolean validateTags(TagValidateDTO tagValidateDTO);
}
