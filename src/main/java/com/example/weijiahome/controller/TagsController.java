package com.example.weijiahome.controller;


import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.dto.BatchDeleteTagsDTO;
import com.example.weijiahome.entity.dto.TagValidateDTO;
import com.example.weijiahome.entity.dto.TagsListDTO;
import com.example.weijiahome.entity.po.Result;
import com.example.weijiahome.entity.po.Tags;
import com.example.weijiahome.entity.vo.TagsCountVO;
import com.example.weijiahome.entity.vo.TagsListVO;
import com.example.weijiahome.service.IArticleTagsService;
import com.example.weijiahome.service.ITagsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * <p>
 * 标签表 前端控制器
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@RestController
@RequestMapping("/api/tags")
public class TagsController {
    @Autowired
    private ITagsService tagsService;
    @Autowired
    private IArticleTagsService articleTagsService;

    /**
     * 获取所有标签列表
     * @param page 页码默认1
     * @param pageSize 每页数量默认10
     * @return
     */
    @GetMapping()
    public Result<Page<Tags>> getTags(@RequestParam(defaultValue = "1")Integer page,
                                      @RequestParam(defaultValue = "10")Integer pageSize){

        return Result.ok(tagsService.getTages(page,pageSize));
    }

    /**
     * 获取指定id的标签详情
     * @param id 标签ID
     * @return
     */
    @GetMapping("/{id}")
    public Result<Tags> getIdByTags(@PathVariable("id") Integer id){

        return Result.ok(tagsService.getById(id));
    }

    /**
     * 创建新标签
     * @param tags
     * @return
     */
    @PostMapping()
    public Result saveTags(@RequestBody Tags tags){
        if (!tagsService.save(tags)){
            return Result.badRequest("添加失败");
        }
        return Result.ok(tags);
    }

    /**
     * 更新指定id的标签
     * @param id
     * @param tags
     * @return
     */
    @PutMapping("/{id}")
    public Result updateTags(@PathVariable("id")Integer id,@RequestBody Tags tags){
        tags.setId(id);
        if (!tagsService.updateById(tags)){
            return  Result.badRequest("更新失败");
        }
        return Result.ok(tags);
    }

    /**
     * 删除指定id的标签
     * @param id
     * @return
     */
    @DeleteMapping("/{id}")
    public Result deleteTags(@PathVariable("id")Integer id){
        if (!tagsService.removeById(id)){
            return Result.badRequest("删除失败");
        }
        return Result.ok("删除成功");
    }
    /**
     * 获取标签下的文章列表
     */
    @GetMapping("/{id}/articless")
    public Result<Page<Integer>> getArticles(
            @PathVariable("id") Integer id,
            @RequestParam(defaultValue = "1")Integer page
            ,@RequestParam(defaultValue = "10")Integer pageSize){
        return Result.ok(articleTagsService.getArticles(id, page, pageSize));
    }
    /**
     * 获取热门标签列表
     */
    @GetMapping("/popular")
    public Result<List<Tags>> getPopular(@RequestParam(defaultValue = "10")Integer limit){
        return Result.ok(tagsService.getPopular(limit));
    }
    /**
     * 批量创建标签
     */
    @PostMapping("/batch")
    public TagsListVO listSaveTags(@RequestBody TagsListDTO tagsListDTO){
        return tagsService.listSaveTags(tagsListDTO);
    }
    /**
     * 批量删除标签
     */
    @DeleteMapping("/batch")
    public Result<Integer> listDeletTags(@RequestBody BatchDeleteTagsDTO batchDeleteTagsDTO){
        return Result.ok(tagsService.listDeletTags(batchDeleteTagsDTO));
    }
    /**
     * 根据关键字搜索标签
     */
    @GetMapping("/search")
    public Result<Page<Tags>> SearchTags(@RequestParam(value = "keyword")String keyword,
                                           @RequestParam(value = "page",defaultValue = "1") Integer page,
                                           @RequestParam(value = "pageSize",defaultValue = "10")Integer pageSize){
       return Result.ok(tagsService.SearchTags(keyword,page,pageSize));
    }
    /**
     * 获取标签统计信息
     */
    @GetMapping("/stats")
    public Result<TagsCountVO> statsTags(){
        return Result.ok(tagsService.statsTags());
    }
    /**
     * 验证标签名称是否可用
     */
    @PostMapping("/validate")
     public  Result validateTags(TagValidateDTO tagValidateDTO){
        if (tagsService.validateTags(tagValidateDTO)){
            return Result.ok("标签名称可用");
        }else {
            return Result.badRequest("标签名称不可用");
        }
    }
}
