package com.example.weijiahome.mapper;

import com.example.weijiahome.entity.po.Users;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

/**
 * <p>
 * 用户表 Mapper 接口
 * </p>
 *
 * @author author
 * @since 2025-10-12
 */
@Mapper
public interface UsersMapper extends BaseMapper<Users> {

    /**
     * 更新头像
     * @param avatar
     */
    @Update("update blog.users set avatar =#{avatar} where id=#{userId}")
    void updateAvatar(@Param("userId") Integer userId, @Param("avatar") String avatar);
}
