import request from './request';
import { isDev } from '@/utils/env';

// 开发环境下初始化模拟服务（如果需要）
// setupMockServer已经在组件中直接导入了模拟API，这里可以保留或移除
if (isDev) {
  try {
    // 可选的初始化操作
    console.log('开发环境 - 使用模拟数据');
  } catch (error) {
    console.warn('模拟服务初始化失败:', error);
  }
}

// API模块定义
const userAPI = {
  login: (data) => request.post('/api/users/login', data),
  register: (data) => request.post('/api/users/register', data),
  logout: () => {
    // 登出功能由前端处理
    return Promise.resolve({ status: 'SUCCESS' });
  },
  getCurrentUser: () => request.get('/api/users/me'),
  updateUser: (data) => request.put('/api/users/me', data),
  changePassword: (data) => request.put('/api/users/me/password', data),
  updateAvatar: (formData) => request.post('/api/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getUserProfile: (id) => request.get(`/api/users/${id}`),
  // 获取用户收藏列表
  getUserFavorites: (params) => request.get('/api/users/favorites', { params }),
  // 获取用户点赞列表
  getUserLikes: (params) => request.get('/api/users/likes', { params })
};

const articleAPI = {
  getArticles: (params) => request.get('/api/articles', { params }),
  getArticleById: (id) => request.get(`/api/articles/${id}`),
  createArticle: (data) => request.post('/api/articles', data),
  updateArticle: (id, data) => request.put(`/api/articles/${id}`, data),
  deleteArticle: (id) => request.delete(`/api/articles/${id}`),
  batchUpdateArticles: (ids, data) => request.post('/api/articles/batch-update', { ids, ...data })
};

const categoryAPI = {
  getCategories: (params) => request.get('/api/categories', { params }),
  getCategoryById: (id) => request.get(`/api/categories/${id}`),
  createCategory: (data) => request.post('/api/categories', data),
  updateCategory: (id, data) => request.put(`/api/categories/${id}`, data),
  deleteCategory: (id) => request.delete(`/api/categories/${id}`),
  getCategoryChildren: (id) => request.get(`/api/categories/${id}/children`),
  getCategoriesTree: () => request.get('/api/categories/tree'),
  batchCreateCategories: (data) => request.post('/api/categories/batch', data),
  batchDeleteCategories: (data) => request.delete('/api/categories/batch', { data }),
  validateCategory: (data) => request.post('/api/categories/validate', data),
  getCategoryStats: () => request.get('/api/categories/stats'),
  getFlatCategories: () => request.get('/api/categories'),
  getSubCategories: (parentId) => request.get(`/api/categories/sub/${parentId}`)
};

const tagAPI = {
  getTags: (params) => request.get('/api/tags', { params }),
  getTagById: (id) => request.get(`/api/tags/${id}`),
  createTag: (data) => request.post('/api/tags', data),
  updateTag: (id, data) => request.put(`/api/tags/${id}`, data),
  deleteTag: (id) => request.delete(`/api/tags/${id}`),
  getPopularTags: (limit = 10) => request.get('/api/tags/popular', { params: { limit } }),
  batchCreateTags: (data) => request.post('/api/tags/batch', data),
  batchDeleteTags: (data) => request.delete('/api/tags/batch', { data }),
  searchTags: (params) => request.get('/api/tags/search', { params }),
  validateTag: (data) => request.post('/api/tags/validate', data),
  getTagStats: () => request.get('/api/tags/stats')
};

const commentAPI = {
  getComments: (params) => request.get('/api/comments', { params }),
  getCommentById: (id) => request.get(`/api/comments/${id}`),
  createComment: (data) => request.post('/api/comments', data),
  updateComment: (id, data) => request.put(`/api/comments/${id}`, data),
  deleteComment: (id) => request.delete(`/api/comments/${id}`),
  batchDeleteComments: (data) => request.delete('/api/comments/batch', { data }),
  likeComment: (id) => request.post(`/api/comments/${id}/like`),
  unlikeComment: (id) => request.post(`/api/comments/${id}/unlike`),
  moderateComment: (id, data) => request.put(`/api/comments/${id}/moderate`, data),
  batchModerateComments: (data) => request.put('/api/comments/batch/moderate', data),
  getCommentStats: (params) => request.get('/api/comments/stats', { params }),
  getPopularComments: (params) => request.get('/api/comments/popular', { params }),
  getRecentComments: (params) => request.get('/api/comments/recent', { params })
};

// 文件管理相关API
const fileAPI = {
  // 获取文件列表
  getFiles: (params) => request.get('/api/files', { params }),
  // 根据ID获取文件
  getFileById: (id) => request.get(`/api/files/${id}`),
  // 上传文件
  uploadFile: (formData) => request.post('/api/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  // 批量上传文件
  batchUploadFiles: (files) => request.post('/api/files/batch-upload', { files }, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  // 删除文件
  deleteFile: (id) => request.delete(`/api/files/${id}`),
  // 批量删除文件
  batchDeleteFiles: (ids) => request.post('/api/files/batch-delete', { ids }),
  // 更新文件信息
  updateFile: (id, data) => request.put(`/api/files/${id}`, data),
  // 获取文件统计
  getFileStats: () => request.get('/api/files/stats'),
  // 获取文件分类
  getFileCategories: () => request.get('/api/files/categories'),
  // 搜索文件
  searchFiles: (keyword) => request.get('/api/files/search', { params: { keyword } }),
  // 获取热门文件
  getPopularFiles: (limit) => request.get('/api/files/popular', { params: { limit } }),
  // 检查文件是否存在
  checkFileExists: (fileName) => request.post('/api/files/check-exists', { fileName }),
  // 获取文件预览URL
  getFilePreviewUrl: (id) => request.get(`/api/files/${id}/preview`),
  // 导出文件列表
  exportFileList: (params) => request.get('/api/files/export', { params }),
  // 下载文件
  downloadFile: (id) => request.get(`/api/files/${id}/download`),
  // 批量下载文件
  batchDownloadFiles: (ids) => request.post('/api/files/batch-download', { ids })
};

// 统一导出
const api = {
  user: userAPI,
  article: articleAPI,
  category: categoryAPI,
  tag: tagAPI,
  comment: commentAPI,
  file: fileAPI
};

// 默认导出
export default api;

// 导出各个模块，方便按需导入
export { userAPI, articleAPI, categoryAPI, tagAPI, commentAPI, fileAPI };