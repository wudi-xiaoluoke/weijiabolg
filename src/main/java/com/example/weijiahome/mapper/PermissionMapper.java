package com.example.weijiahome.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.weijiahome.entity.po.Permission;
import com.example.weijiahome.entity.po.Role;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PermissionMapper extends BaseMapper<Permission> {

}
