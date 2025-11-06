package com.example.weijiahome.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.dto.BatchDeleteTagsDTO;
import com.example.weijiahome.entity.dto.TagValidateDTO;
import com.example.weijiahome.entity.dto.TagsListDTO;
import com.example.weijiahome.entity.vo.TagsCountVO;
import com.example.weijiahome.entity.vo.TagsListVO;
import com.example.weijiahome.exception.BusinessException;
import com.example.weijiahome.mapper.TagsMapper;
import com.example.weijiahome.entity.po.Tags;

import com.example.weijiahome.service.ITagsService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * <p>
 * 标签表 服务实现类
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Service
public class TagsServiceImpl extends ServiceImpl<TagsMapper, Tags> implements ITagsService {
    /**
     * 获取所有标签列表
     * @param page
     * @param pageSize
     */
    @Autowired
    private  TagsMapper tagsMapper;
    @Override
    public Page<Tags> getTages(Integer page, Integer pageSize) {
        // 1. 创建分页对象（Page<实体类>）
        //构建偏移参数

        Page<Tags> tagsPage = new Page<>(page, pageSize);

        // 2. 构建查询条件（可选，若无条件可传 null）
        QueryWrapper<Tags> queryWrapper = new QueryWrapper<>();
        // 3. 执行分页查询（自动拼接 LIMIT 语句）
        return tagsMapper.selectPage(tagsPage, queryWrapper);
    }

    /**
     * 获取热门标签列表
     * @param limit
     */
    @Override
    public List<Tags> getPopular(Integer limit) {
        return tagsMapper.getPopular(limit);
    }

    /**
     * 批量创建标签
     * @param tagsListDTO
     * @return
     */
    @Override
    public TagsListVO listSaveTags(TagsListDTO tagsListDTO) {
        TagsListVO result = new TagsListVO();//最终返回对象
        List<Tags> existingTags = new ArrayList<>(); // 已存在标签
        List<Tags> newTagNames = new ArrayList<>();  // 待新建的标签名称
        List<String> tags = tagsListDTO.getTags();
        // 1. 参数校验：去重（避免重复处理同一个标签）
        Set<String> distinctTagNames = new HashSet<>(tags);
        if (distinctTagNames.isEmpty()){
            result.setAlreadyExists(existingTags);
            result.setCreated(new ArrayList<>());
            return result;
        }

        // 2. 批量查询数据库中已存在的标签（用标签名称作为条件）
            LambdaQueryWrapper<Tags> qw = new LambdaQueryWrapper<>();
            qw.in(Tags::getName, distinctTagNames); // 批量查询

            List<Tags> dbTags = tagsMapper.selectList(qw);
        // 3. 用 Map 缓存已存在的标签（key=标签名称，value=标签对象）
            Map<String,Tags> map =new HashMap<>();
        for (Tags dbTag : dbTags) {
            if (!map.containsKey(dbTag.getName())) {
                map.put(dbTag.getName(), dbTag);
            }
        }
        // 4. 遍历去重后的标签，通过 Map 区分“已存在”和“新建”
        for (String TagName : distinctTagNames) {

            if (map.containsKey(TagName)){
                //已存在，存入existingTags
                existingTags.add(map.get(TagName));
            }else {
                // 新建：先存入待新建列表（后续批量插入）
                Tags t =new Tags();
                newTagNames.add(t.setName(TagName));
            }
        }
        // 5. 批量插入新建标签（如果有）
        for (Tags newTagName : newTagNames) {
            tagsMapper.insert(newTagName);
        }

        // 6. 组装结果返回
        result.setCreated(newTagNames);
        result.setAlreadyExists(existingTags);
        return result;
    }

    /**
     * 批量删除标签
     * @param batchDeleteTagsDTO
     */
    @Override
    public Integer listDeletTags(BatchDeleteTagsDTO batchDeleteTagsDTO) {
        List<Integer> ids = batchDeleteTagsDTO.getIds();

        // 1. 参数校验：避免空数组
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException("请传入要删除的标签ID"); // 自定义业务异常
        }

        // 2. 批量查询存在的ID（MP的listByIds批量查询，效率比循环查高）
        List<Tags> existTags = tagsMapper.selectBatchIds(ids);
        List<Integer> existIds = existTags.stream()
                .map(Tags::getId)
                .collect(Collectors.toList());

        // 3. 找出不存在的ID
        List<Integer> notExistIds = ids.stream()
                .filter(id -> !existIds.contains(id))
                .collect(Collectors.toList());

        // 4. 有不存在的ID则抛异常（前端可捕获异常返回错误信息）
        if (!notExistIds.isEmpty()) {
            throw new BusinessException("标签ID不存在：" + notExistIds.toString());
        }

        // 5. 所有ID都存在，执行批量删除（MP的removeByIds效率比循环删高）
        return tagsMapper.deleteBatchIds(ids);

    }

    /**
     * 根据关键词搜索标签
     * @param keyword 搜索关键词
     * @param page  页码 默认1
     * @param pageSize  每页数量 默认10
     */
    @Override
    public Page<Tags> SearchTags(String keyword, Integer page, Integer pageSize) {
        Page<Tags> pageObj = new Page<>(page, pageSize);

        LambdaQueryWrapper<Tags> tags =new LambdaQueryWrapper<>();
        tags.like(Tags::getName,keyword);
        return tagsMapper.selectPage(pageObj, tags);
    }

    /**
     * 获取标签的统计信息
     * @return
     */
    @Override
    public TagsCountVO statsTags() {
        LambdaQueryWrapper<Tags> queryWrapper =new LambdaQueryWrapper<>();
        Integer count = 0;
        //查找所有标签的article_count 并累计出来
        queryWrapper.select(Tags::getArticleCount);
        List<Tags> tagsList = tagsMapper.selectList(queryWrapper);
        for (Tags tags : tagsList) {
            count = count+ tags.getArticleCount();
        }


        QueryWrapper<Tags> tags = new QueryWrapper<>();
        Long l = tagsMapper.selectCount(tags);
        Integer totalTagNum = (int) l.longValue();
        TagsCountVO tagsVO =new TagsCountVO();
        tagsVO.setTotal(totalTagNum);
        tagsVO.setUsageCount(count);

        return tagsVO;
    }

    /**
     * 验证标签名称是否可用
     * @param tagValidateDTO
     */
    @Override
    public boolean validateTags(TagValidateDTO tagValidateDTO) {
        // 1. 前置校验：标签名称不能为空（避免无效查询）
        if (!StringUtils.hasText(tagValidateDTO.getName())) {
            throw new BusinessException("标签名称不能为空"); // 抛自定义异常，由全局处理器捕获
        }

        // 2. 构建查询条件：名称等于传入值
        QueryWrapper<Tags> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("name", tagValidateDTO.getName());

        // 3. 若传入了ID（更新场景），添加条件：排除自身ID
        Integer id = tagValidateDTO.getId();
        if (id != null) {
            queryWrapper.ne("id", id); // ne = not equal（ID不等于自身）
        }

        // 4. 高效判断：是否存在符合条件的记录（仅查是否存在，不查完整数据）
        boolean isNameExists = tagsMapper.exists(queryWrapper);

        // 5. 结果：存在则返回false（名称不可用），不存在则返回true（名称可用）
        return !isNameExists;
    }


}
