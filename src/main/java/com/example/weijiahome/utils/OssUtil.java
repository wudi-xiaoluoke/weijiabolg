package com.example.weijiahome.utils;

import com.aliyun.oss.HttpMethod;
import com.aliyun.oss.OSS;
import com.aliyun.oss.model.GeneratePresignedUrlRequest;
import com.aliyun.oss.model.ObjectMetadata;
import com.aliyun.oss.model.PutObjectRequest;
import com.example.weijiahome.config.AliyunOssProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Date;
import java.util.UUID;

@Component
public class OssUtil {

    @Resource
    private OSS ossClient;

    @Resource
    private AliyunOssProperties aliyunOssProperties;

    /**
     * 上传用户头像
     */
    public String uploadAvatar(MultipartFile file) throws IOException {
        return uploadFile(file, aliyunOssProperties.getAvatarPrefix());
    }

    /**
     * 上传普通文件
     */
    public String uploadCommonFile(MultipartFile file) throws IOException {
        return uploadFile(file, aliyunOssProperties.getFilePrefix());
    }

    /**
     * 通用文件上传
     */
    private String uploadFile(MultipartFile file, String prefix) throws IOException {
        // 生成唯一文件名，避免重复
        String originalFilename = file.getOriginalFilename();
        String fileSuffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = prefix + UUID.randomUUID().toString() + fileSuffix;

        // 设置文件元数据
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        // 上传文件
        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    aliyunOssProperties.getBucketName(),
                    fileName,
                    inputStream,
                    metadata
            );
            ossClient.putObject(putObjectRequest);
        }

        // 返回文件访问URL
        return aliyunOssProperties.getDomain() + "/" + fileName;
    }

    /**
     * 生成预签名URL（用于前端直传）
     */
    public String generatePresignedUrl(String fileName, boolean isAvatar, int expireSeconds) {
        String prefix = isAvatar ? aliyunOssProperties.getAvatarPrefix() : aliyunOssProperties.getFilePrefix();
        String key = prefix + fileName;

        // 设置URL过期时间
        Date expiration = new Date(System.currentTimeMillis() + expireSeconds * 1000L);

        // 生成PUT方法的预签名URL
        GeneratePresignedUrlRequest request = new GeneratePresignedUrlRequest(
                aliyunOssProperties.getBucketName(),
                key,
                HttpMethod.PUT
        );
        request.setExpiration(expiration);

        URL url = ossClient.generatePresignedUrl(request);
        return url.toString();
    }

    /**
     * 删除OSS上的文件
     */
    public void deleteFile(String fileUrl) {
        // 从URL中提取文件名
        String key = fileUrl.replace(aliyunOssProperties.getDomain() + "/", "");
        ossClient.deleteObject(aliyunOssProperties.getBucketName(), key);
    }
}
