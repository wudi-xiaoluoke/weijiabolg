import request from '../../utils/request'

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 关键词搜索
 * @param {number} params.categoryId - 分类ID
 * @param {number} params.tagId - 标签ID
 * @returns {Promise}
 */
export const getArticles = (params = {}) => {
  return request.get('/articles', { params })
}

/**
 * 获取文章详情
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const getArticleById = (id) => {
  return request.get(`/articles/${id}`)
}

/**
 * 创建文章
 * @param {Object} data - 文章数据
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @param {number} data.categoryId - 分类ID
 * @param {Array} data.tagIds - 标签ID数组
 * @returns {Promise}
 */
export const createArticle = (data) => {
  return request.post('/articles', data)
}

/**
 * 更新文章
 * @param {number} id - 文章ID
 * @param {Object} data - 文章数据
 * @returns {Promise}
 */
export const updateArticle = (id, data) => {
  return request.put(`/articles/${id}`, data)
}

/**
 * 删除文章
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const deleteArticle = (id) => {
  return request.delete(`/articles/${id}`)
}

/**
 * 更新文章发布状态
 * @param {number} id - 文章ID
 * @param {boolean} published - 是否发布
 * @returns {Promise}
 */
export const updatePublishStatus = (id, published) => {
  return request.put(`/articles/${id}/publish-status`, { published })
}

/**
 * 更新文章点赞状态
 * @param {number} id - 文章ID
 * @param {boolean} liked - 是否点赞
 * @returns {Promise}
 */
export const updateLikeStatus = (id, liked) => {
  return request.put(`/articles/${id}/like-status`, { liked })
}

/**
 * 获取文章评论列表
 * @param {number} articleId - 文章ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getArticleComments = (articleId, params = {}) => {
  return request.get(`/articles/${articleId}/comments`, { params })
}

/**
 * 创建文章评论
 * @param {number} articleId - 文章ID
 * @param {Object} data - 评论数据
 * @param {string} data.content - 评论内容
 * @param {number} data.parentId - 父评论ID（可选）
 * @returns {Promise}
 */
export const createArticleComment = (articleId, data) => {
  return request.post(`/articles/${articleId}/comments`, data)
}

// 获取用户文章列表
export const getUserArticles = (params = {}) => {
  return request.get('/api/articles/user', { params })
}

// 保留一些现有功能接口
export const getHotArticles = (limit = 10) => {
  return request.get('/api/articles/hot', { params: { limit } })
}

export const getRecommendArticles = (limit = 10) => {
  return request.get('/api/articles/recommend', { params: { limit } })
}