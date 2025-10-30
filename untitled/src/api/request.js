// axios 实例配置
import axios from 'axios';
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
      config.headers.Authorization = `Bearer ${token}`;
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
    const { data } = response;
    
    // 模拟环境下，直接返回数据
    if (process.env.NODE_ENV === 'development' && window.mockData) {
      return Promise.resolve(data);
    }
    
    // 直接返回数据，不做额外处理
    // 后端API文档显示直接返回数据对象，不包含外层状态码等信息
    return Promise.resolve(data);
  },
  error => {
    console.error('响应错误:', error);
    
    // 网络错误处理
    if (!error.response) {
      console.error('网络错误，请检查网络连接');
      // 在开发环境下，如果是未登录或服务器拒绝访问，提供友好提示
      if (process.env.NODE_ENV === 'development') {
        console.warn('提示: 可能是后端服务未启动或未登录状态');
      }
      return Promise.reject(error);
    }
    
    const { status } = error.response;
    // 根据不同状态码提供友好提示
    switch (status) {
      case 401:
        console.error('未授权，请重新登录');
        break;
      case 403:
        console.error('服务器拒绝访问');
        break;
      case 404:
        console.error('请求的资源不存在');
        break;
      case 500:
        console.error('服务器内部错误');
        break;
      default:
        console.error(`请求失败，状态码: ${status}`);
    }
    
    // 根据HTTP状态码处理
    switch (status) {
      case 401:
        removeToken();
        window.location.href = '/login';
        break;
      case 403:
        console.error('服务器拒绝访问');
        break;
      case 404:
        console.error('请求的资源不存在');
        break;
      case 500:
        console.error('服务器内部错误');
        break;
      default:
        console.error(`请求失败: ${status}`);
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

export default service;