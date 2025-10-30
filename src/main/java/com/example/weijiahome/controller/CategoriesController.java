package com.example.weijiahome.controller;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.weijiahome.entity.po.Categories;
import com.example.weijiahome.entity.po.Result;
import com.example.weijiahome.service.IArticleCategoriesService;
import com.example.weijiahome.service.ICategoriesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * <p>
 * 分类表 前端控制器
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@RestController
@RequestMapping("/api/categories")
public class CategoriesController {
    @Autowired
    private ICategoriesService categoriesService;
    @Autowired
    private IArticleCategoriesService articleCategoriesService;

    /**
     * 获取分类列表
     * @return
     */
    @GetMapping()
    public Result<List<Categories>> getCategoriesList(){
       return Result.ok(categoriesService.list());
    }

    /**
     * 获取分类详情
     */
    @GetMapping("/{id}")
    public Result<Categories> getCategories(@PathVariable("id") Integer id){
        Categories categories = categoriesService.getById(id);
        return Result.ok(categories);
    }
    /**
     * 创建分类
     */
    @PostMapping()
    public Result creatCategories(@RequestBody Categories categories){
        String name = categories.getName();
        Categories c = new Categories();
        c.setName(name);
        c.setCreateTime(LocalDateTime.now());
        categoriesService.save(c);
        return Result.ok("分类创建成功");
    }
    /**
     * 更新分类
     */
    @PutMapping("/{id}")
    public Result updateCategories(@PathVariable("id") Integer id,@RequestBody Categories categories){

        Categories c =new Categories();
            c.setId(id)
                .setName(categories.getName())
                .setUpdateTime(LocalDateTime.now());
        if (!categoriesService.updateById(c)) {
            return Result.error(404,"更新分类失败");
        }
        return Result.ok("更新分类成功");
    }
    /**
     * 删除分类
     */
    @DeleteMapping("/{id}")
    public Result deleteCategories(@PathVariable("id") Integer id){

        Categories c =new Categories();
            c.setId(id);
        if ( !categoriesService.removeById(c)){
            return Result.error(404,"删除分类失败");
        }
        return Result.ok("删除分类成功");
    }
    /**
     * 获取分类下的文章列表
     */
    @GetMapping("/{id}/articles")
    public Result<IPage<Integer> > getCategoriesList(@PathVariable("id")Integer id,Integer page,Integer pageSize){
        //通过前端传过来的分类id，在分类-文章表 查询有分类id的文章id，放进list并返回,还要分页查询
        IPage<Integer> integerIPage = articleCategoriesService.GetCategoriesList(id, page, pageSize);
        return Result.ok(integerIPage);
    }
}
