// API配置文件

// API基础URL
// 根据后端API文档，大多数接口使用/api/前缀
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
  // 用户认证相关
  AUTH: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    LOGOUT: '/api/users/logout',
    ME: '/api/users/me',
    UPDATE_PROFILE: '/api/users/me',
    UPDATE_PASSWORD: '/api/users/me/password',
    UPDATE_AVATAR: '/api/users/me/avatar'
  },
  
  // 文章相关
  ARTICLES: {
    LIST: '/api/articles',
    DETAIL: (id) => `/articles/${id}`, // 文档中没有/api/前缀
    CREATE: '/articles', // 文档中没有/api/前缀
    UPDATE: (id) => `/articles/${id}`, // 文档中没有/api/前缀
    DELETE: (id) => `/articles/${id}`, // 文档中没有/api/前缀
    PUBLISH_STATUS: (id) => `/articles/${id}/publish-status`,
    LIKE_STATUS: (id) => `/api/articles/${id}/like-status`,
    LIKE_STATUS2: (id) => `/articles/${id}/like-status`, // 兼容文档中的两种路径
    GET_LIKE_STATUS: (id) => `/articles/${id}/like/status`,
    FAVORITE: (id) => `/articles/${id}/favorite`,
    UNFAVORITE: (id) => `/articles/${id}/unfavorite`,
    GET_FAVORITE_STATUS: (id) => `/articles/${id}/favorite/status`,
    SHARE: '/articles/share'
  },
  
  // 分类相关
  CATEGORIES: {
    LIST: '/api/categories',
    DETAIL: (id) => `/api/categories/${id}`,
    CREATE: '/api/categories',
    UPDATE: (id) => `/api/categories/${id}`,
    DELETE: (id) => `/api/categories/${id}`,
    ARTICLES: (id) => `/api/categories/${id}/articles`
  },
  
  // 标签相关
  TAGS: {
    LIST: '/api/tags',
    DETAIL: (id) => `/api/tags/${id}`,
    CREATE: '/api/tags',
    UPDATE: (id) => `/api/tags/${id}`,
    DELETE: (id) => `/api/tags/${id}`,
    POPULAR: '/api/tags/popular',
    BATCH: '/api/tags/batch',
    SEARCH: '/api/tags/search',
    VALIDATE: '/api/tags/validate',
    STATS: '/api/tags/stats'
  },
  
  // 评论相关
  COMMENTS: {
    LIST: '/api/comments',
    CREATE: '/api/comments',
    DETAIL: (id) => `/api/comments/${id}`,
    UPDATE: (id) => `/api/comments/${id}`,
    DELETE: (id) => `/api/comments/${id}`,
    BATCH_DELETE: '/api/comments/batch',
    LIKE: (id) => `/api/comments/${id}/like`,
    UNLIKE: (id) => `/api/comments/${id}/unlike`,
    STATS: '/api/comments/stats',
    HOT: '/api/comments/hot',
    LATEST: '/api/comments/latest'
  },
  
  // 用户相关
  USERS: {
    DETAIL: (id) => `/api/users/${id}`,
    FOLLOW: (id) => `/users/${id}/follow`,
    UNFOLLOW: (id) => `/users/${id}/unfollow`,
    GET_FOLLOW_STATUS: (id) => `/users/${id}/follow/status`,
    FOLLOWERS: (id) => `/users/${id}/followes`, // 注意文档中的拼写followes
    FOLLOWINGS: (id) => `/users/${id}/followings`,
    FAVORITES: '/user/favorites',
    LIKES: '/user/likes'
  },
  
  // 文件上传相关
  UPLOAD: {
    AVATAR: '/file/avatar',
    COMMON: '/file/common',
    PRESIGNED_URL: '/file/presigned-url',
    DELETE: '/file'
  }
};

// Mock数据配置
const MOCK_CONFIG = {
  ENABLED: import.meta.env.VITE_ENABLE_MOCK === 'true' || false, // 默认禁用mock
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