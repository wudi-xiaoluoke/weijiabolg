package com.example.weijiahome.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.weijiahome.entity.po.Result;
import com.example.weijiahome.entity.po.Users;
import com.example.weijiahome.service.IUsersService;

import com.example.weijiahome.utils.JwtUtil;
import com.example.weijiahome.utils.PasswordUtil;
import org.apache.catalina.User;
import org.apache.el.parser.Token;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory; // 导入日志类

import java.awt.*;
import java.util.regex.Pattern;
@RestController
@RequestMapping("/api/users")
public class LoginController {
    private static final Logger logger = LoggerFactory.getLogger(LoginController.class); // 声明日志对象
    @Autowired
    private IUsersService usersService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordUtil passwordUtil;

    // 邮箱正则表达式
    private static final String EMAIL_REGEX = "^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);
    /**
     * 用户登录模块
     */
    @PostMapping("/login")
    public Result loginUser(@RequestBody Users loginUser){
        //拿到前端的username和password
        String username = loginUser.getUsername();
        String password = loginUser.getPassword();
        // 构建查询条件
        QueryWrapper<Users> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username",username);
        //查询密码
        Users user = usersService.getOne(queryWrapper);
        //判断用户是否存在
        if (user ==null ){
            return Result.badRequest("用户名或密码错误");
        }
        //校验参数
        if (username == null || password ==null){
            return Result.badRequest("用户名或密码不能为空");
        }

        //比较密码
        if (!passwordUtil.matchesPassword(password,user.getPassword()) == true){
            return Result.badRequest("用户名或密码错误");
        }

        //验证通过生成jwt并返回
        return Result.ok(jwtUtil.generateToken(user.getId().toString(),user.getRole()));
    }


    @PostMapping("/register")
    public Result registerUser(@RequestBody Users users){
        logger.info("开始处理注册请求，用户名：{}，邮箱：{}", users.getUsername(), users.getEmail()); // 打印请求参数
        //判断输入合法性
        String username = users.getUsername();
        String password = users.getPassword();
        String email = users.getEmail();
        if (username == null || username.trim().isEmpty() ||
                password == null || password.trim().isEmpty() ||
                email == null || email.trim().isEmpty()) {
            return Result.badRequest("用户名、密码和邮箱不能为空");
        }
        //格式校验
        if (username.length() < 4 || username.length() > 20) {
            return Result.badRequest("用户名长度必须在4-20个字符之间");
        }
        if (password.length() < 6) {
            return Result.badRequest("密码长度不能少于6位");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return Result.badRequest("邮箱格式不正确");
        }
        //查询用户名是否重复
        QueryWrapper<Users> usernameQuery = new QueryWrapper<>();
        usernameQuery.eq("username",username);
        Users user = usersService.getOne(usernameQuery);

        if (user !=null){
            return Result.badRequest("用户名重复");
        }
        //查询用户邮箱是否重复
        QueryWrapper<Users> emailQuery = new QueryWrapper<>();
        emailQuery.eq("email", email);
        if (usersService.getOne(emailQuery) != null) {
            return Result.badRequest("该邮箱已被注册");
        }

        //给用户一个默认头像
        users.setAvatar("/images/生成用户默认头像.png");
        //密码加密
        String s = passwordUtil.encodePassword(password);
        users.setPassword(s);
        boolean saveResult = usersService.save(users);
        if (saveResult) {
            logger.info("用户注册成功，用户名：{}", users.getUsername()); // 打印成功日志
            return Result.ok("注册成功");
        } else {
            logger.error("用户注册失败，保存到数据库失败，用户名：{}", users.getUsername()); // 打印失败日志
            return Result.badRequest("注册失败");
        }
    }
}
