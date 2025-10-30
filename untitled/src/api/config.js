// API配置文件

// API基础URL
// 根据后端API文档，有些端点使用/api/前缀，有些不使用
// 为了兼容不同端点，这里保持为空，让具体API调用中指定完整路径
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// API超时时间
const TIMEOUT = 10000; // 10秒

// API响应状态码
const STATUS_CODE = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};

// API请求方法
const METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

// API端点配置
export const API_BASE_URL = BASE_URL;
export const SUCCESS_CODE = STATUS_CODE.SUCCESS;

// 端点配置，根据后端API文档更新
const ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    GET_PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
    UPDATE_PASSWORD: '/auth/password'
  },
  
  // 文章相关
  ARTICLES: {
    LIST: '/articles',
    DETAIL: (id) => `/articles/${id}`,
    CREATE: '/articles',
    UPDATE: (id) => `/articles/${id}`,
    DELETE: (id) => `/articles/${id}`,
    PUBLISH: (id) => `/articles/${id}/publish`,
    UNPUBLISH: (id) => `/articles/${id}/unpublish`,
    USER_ARTICLES: (userId) => `/users/${userId}/articles`,
    SEARCH: '/articles/search',
    RECOMMEND: '/articles/recommend'
  },
  
  // 分类相关
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`
  },
  
  // 标签相关
  TAGS: {
    LIST: '/tags',
    CREATE: '/tags',
    DELETE: (id) => `/tags/${id}`
  },
  
  // 评论相关
  COMMENTS: {
    LIST: (articleId) => `/articles/${articleId}/comments`,
    CREATE: (articleId) => `/articles/${articleId}/comments`,
    UPDATE: (id) => `/comments/${id}`,
    DELETE: (id) => `/comments/${id}`,
    REPLY: (commentId) => `/comments/${commentId}/replies`,
    LIKE: (id) => `/comments/${id}/like`,
    UNLIKE: (id) => `/comments/${id}/unlike`
  },
  
  // 用户相关
  USERS: {
    DETAIL: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    FOLLOW: (id) => `/users/${id}/follow`,
    UNFOLLOW: (id) => `/users/${id}/unfollow`,
    FOLLOWERS: (id) => `/users/${id}/followers`,
    FOLLOWING: (id) => `/users/${id}/following`
  },
  
  // 文件上传相关
  UPLOAD: {
    IMAGE: '/upload/image',
    FILE: '/upload/file',
    AVATAR: '/upload/avatar'
  },
  
  // 统计相关
  STATS: {
    OVERVIEW: '/stats/overview',
    ARTICLE_STATS: '/stats/articles',
    USER_STATS: '/stats/users'
  }
};

// Mock数据配置
const MOCK_CONFIG = {
  ENABLED: import.meta.env.VITE_ENABLE_MOCK === 'true' || true, // 默认启用mock
  DELAY: 300, // mock响应延迟（毫秒）
  ERROR_RATE: 0 // mock错误率（0-1），用于模拟网络错误
};

export {
  BASE_URL,
  TIMEOUT,
  STATUS_CODE,
  METHOD,
  ENDPOINTS,
  MOCK_CONFIG
};