package com.example.weijiahome.controller;


import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.weijiahome.entity.po.Result;
import com.example.weijiahome.entity.po.Tags;
import com.example.weijiahome.service.IArticleTagsService;
import com.example.weijiahome.service.ITagsService;
import com.example.weijiahome.service.impl.TagsServiceImpl;
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
    @GetMapping()
    public Result<List<Tags>> getTags(){
        List<Tags> list = tagsService.list();
        return Result.ok(list);
    }
    @GetMapping("/{id}")
    public Result<Tags> getIdByTags(@PathVariable("id") Integer id){

        return Result.ok(tagsService.getById(id));
    }
    @PostMapping()
    public Result saveTags(@RequestBody Tags tags){
        if (!tagsService.save(tags)){
            return Result.badRequest("添加失败");
        }
        return Result.ok("添加成功");
    }
    @PutMapping("/{id}")
    public Result updateTags(@PathVariable("id")Integer id,@RequestBody Tags tags){
        tags.setId(id);
        if (!tagsService.updateById(tags)){
            return  Result.badRequest("更新失败");
        }
        return Result.ok("更新成功");
    }
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
}
