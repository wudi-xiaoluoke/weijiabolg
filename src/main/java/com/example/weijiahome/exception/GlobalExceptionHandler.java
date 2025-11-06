package com.example.weijiahome.exception;

import com.example.weijiahome.entity.po.Result;
import com.example.weijiahome.exception.BusinessException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器：统一捕获并处理所有异常
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 捕获自定义业务异常（BusinessException）
     */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        return Result.badRequest(e.getMessage()); // 或根据异常中的code返回对应状态
    }

    /**
     * 捕获其他未知异常（如系统异常）
     */
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        e.printStackTrace(); // 日志记录异常详情
        return Result.badRequest("系统异常，请联系管理员");
    }
}