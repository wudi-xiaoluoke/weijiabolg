package com.example.weijiahome.exception;

import com.example.weijiahome.entity.dto.BatchDeleteTagsDTO;
import com.example.weijiahome.entity.po.Result;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

// 自定义业务异常类
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}

