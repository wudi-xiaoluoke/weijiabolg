// axios 实例配置
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { API_BASE_URL, TIMEOUT, SUCCESS_CODE } from './config';
import { getToken, removeToken } from '../utils/auth';

// 创建axios实例
const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 使用auth工具函数获取token
    const token = getToken();
    if (token) {
      // 确保token格式正确
      const tokenString = typeof token === 'string' ? token : String(token);
      config.headers.Authorization = `Bearer ${tokenString}`;
    }
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const { data, config } = response;
    
    // 后端返回的是Result<T>格式，需要提取其中的data字段
    // 支持状态码和字符串状态两种格式的响应
    if (data) {
      // 处理标准的Result响应格式
      if (data.status === 'SUCCESS') {
        return Promise.resolve(data.data);
      } 
      // 处理可能的code格式响应
      else if (data.code !== undefined) {
        const successCodes = Array.isArray(SUCCESS_CODE) ? SUCCESS_CODE : [SUCCESS_CODE];
        if (successCodes.includes(data.code) || data.code === 0 || data.code === 200) {
          // 对分页数据特殊处理，保留原始结构
          if (data.data && (data.pageNum || data.total || data.pages)) {
            return Promise.resolve(data);
          }
          return Promise.resolve(data.data || data);
        } else {
          ElMessage.error(data.message || '请求失败');
          return Promise.reject(new Error(data.message || '请求失败'));
        }
      }
    }
    
    // 兼容其他可能的数据格式
    return Promise.resolve(data);
  },
  error => {
    console.error('响应错误:', error);
    
    // 处理超时错误
    if (error.message?.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试');
      return Promise.reject(error);
    }
    
    // 网络错误处理
    if (!error.response) {
      ElMessage.error('网络错误，请检查网络连接');
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    
    // 根据HTTP状态码处理不同的错误
    switch (status) {
      case 401:
        ElMessage.error('请先登录');
        removeToken();
        // 延迟跳转，确保用户看到错误提示
        setTimeout(() => {
          // 避免循环重定向
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 1000);
        break;
      case 403:
        ElMessage.error('没有权限访问该资源');
        break;
      case 404:
        ElMessage.error('请求的资源不存在');
        break;
      case 500:
        ElMessage.error('服务器内部错误');
        break;
      default:
        ElMessage.error(data?.message || `请求失败，状态码: ${status}`);
    }
    
    return Promise.reject(error);
  }
);

// 导出请求方法
export const request = {
  get(url, params = {}) {
    return service.get(url, { params });
  },
  post(url, data = {}) {
    return service.post(url, data);
  },
  put(url, data = {}) {
    return service.put(url, data);
  },
  delete(url, params = {}) {
    return service.delete(url, { params });
  },
  patch(url, data = {}) {
    return service.patch(url, data);
  }
};

// 导出单独的方法以增强灵活性
export const get = (url, params = {}) => service.get(url, { params });
export const post = (url, data = {}, config = {}) => service.post(url, data, config);
export const put = (url, data = {}, config = {}) => service.put(url, data, config);
export const del = (url, params = {}) => service.delete(url, { params });
export const patch = (url, data = {}, config = {}) => service.patch(url, data, config);

export default service;