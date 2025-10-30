package com.example.weijiahome.controller;


import com.example.weijiahome.utils.OssUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/file")
public class OssController {

    @Autowired
    private OssUtil ossUtil;

    /**
     * 上传用户头像
     */
    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            String url = ossUtil.uploadAvatar(file);
            Map<String, String> result = new HashMap<>();
            result.put("url", url);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "头像上传失败: " + e.getMessage()));
        }
    }

    /**
     * 上传普通文件
     */
    @PostMapping("/common")
    public ResponseEntity<Map<String, String>> uploadCommonFile(@RequestParam("file") MultipartFile file) {
        try {
            String url = ossUtil.uploadCommonFile(file);
            Map<String, String> result = new HashMap<>();
            result.put("url", url);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "文件上传失败: " + e.getMessage()));
        }
    }

    /**
     * 获取预签名URL（用于前端直传）
     */
    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @RequestParam("fileName") String fileName,
            @RequestParam(value = "isAvatar", defaultValue = "false") boolean isAvatar,
            @RequestParam(value = "expireSeconds", defaultValue = "3600") int expireSeconds) {

        String url = ossUtil.generatePresignedUrl(fileName, isAvatar, expireSeconds);
        return ResponseEntity.ok(Map.of("presignedUrl", url));
    }

    /**
     * 删除文件
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteFile(@RequestParam("fileUrl") String fileUrl) {
        ossUtil.deleteFile(fileUrl);
        return ResponseEntity.noContent().build();
    }
}
