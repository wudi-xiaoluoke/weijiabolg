package com.example.weijiahome.entity.po;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * RESTful API统一返回结果类
 */
@Data
public class Result<T> {
    // 状态码（遵循HTTP状态码规范）
    private int code;

    // 业务状态标识（SUCCESS/ERROR）
    private String status;

    // 响应消息
    private String message;

    // 响应数据
    private T data;

    // 响应时间
    private LocalDateTime timestamp;

    // 私有构造方法，防止直接实例化
    private Result() {
        this.timestamp = LocalDateTime.now();
    }

    /**
     * 成功响应（带数据）
     */
    public static <T> Result<T> success(int code, String message, T data) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setStatus("SUCCESS");
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    /**
     * 成功响应（不带数据）
     */
    public static <T> Result<T> success(int code, String message) {
        return success(code, message, null);
    }

    /**
     * 成功响应快捷方法 - 200 OK
     */
    public static <T> Result<T> ok(T data) {
        return success(200, "请求成功", data);
    }

    /**
     * 成功响应快捷方法 - 201 Created
     */
    public static <T> Result<T> created(T data) {
        return success(201, "资源创建成功", data);
    }

    /**
     * 错误响应
     */
    public static <T> Result<T> error(int code, String message, T data) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setStatus("ERROR");
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    /**
     * 错误响应（不带数据）
     */
    public static <T> Result<T> error(int code, String message) {
        return error(code, message, null);
    }

    /**
     * 错误响应快捷方法 - 400 Bad Request
     */
    public static <T> Result<T> badRequest(String message) {
        return error(400, message);
    }

    /**
     * 错误响应快捷方法 - 401 Unauthorized
     */
    public static <T> Result<T> unauthorized(String message) {
        return error(401, message);
    }

    /**
     * 错误响应快捷方法 - 403 Forbidden
     */
    public static <T> Result<T> forbidden(String message) {
        return error(403, message);
    }

    /**
     * 错误响应快捷方法 - 404 Not Found
     */
    public static <T> Result<T> notFound(String message) {
        return error(404, message);
    }

    /**
     * 错误响应快捷方法 - 500 Internal Server Error
     */
    public static <T> Result<T> serverError(String message) {
        return error(500, message);
    }
}
