import request from '../../utils/request'
import { ENDPOINTS } from '../config'

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 关键词搜索
 * @param {number} params.categoryId - 分类ID
 * @param {number} params.tagId - 标签ID
 * @param {string} params.sort - 排序方式
 * @param {string} params.order - 排序顺序
 * @returns {Promise}
 */
export const getArticles = (params = {}) => {
  return request.get(ENDPOINTS.ARTICLES.LIST, { params })
}

/**
 * 获取文章详情
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const getArticleById = (id) => {
  return request.get(ENDPOINTS.ARTICLES.DETAIL(id))
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
  return request.post(ENDPOINTS.ARTICLES.CREATE, data)
}

/**
 * 更新文章
 * @param {number} id - 文章ID
 * @param {Object} data - 文章数据
 * @returns {Promise}
 */
export const updateArticle = (id, data) => {
  return request.put(ENDPOINTS.ARTICLES.UPDATE(id), data)
}

/**
 * 删除文章
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const deleteArticle = (id) => {
  return request.delete(ENDPOINTS.ARTICLES.DELETE(id))
}

/**
 * 更新文章发布状态
 * @param {number} id - 文章ID
 * @param {boolean} published - 是否发布
 * @returns {Promise}
 */
export const updatePublishStatus = (id, published) => {
  return request.put(ENDPOINTS.ARTICLES.PUBLISH_STATUS(id), published)
}

/**
 * 更新文章点赞状态
 * @param {number} id - 文章ID
 * @param {boolean} liked - 是否点赞
 * @returns {Promise}
 */
export const updateLikeStatus = (id, liked) => {
  // 尝试使用带/api/前缀的接口，如果失败则使用不带前缀的接口
  return request.put(ENDPOINTS.ARTICLES.LIKE_STATUS(id), liked)
    .catch(() => request.put(ENDPOINTS.ARTICLES.LIKE_STATUS2(id), liked))
}

/**
 * 获取文章点赞状态
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const getArticleLikeStatus = (id) => {
  return request.get(ENDPOINTS.ARTICLES.GET_LIKE_STATUS(id))
}

/**
 * 收藏文章
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const favoriteArticle = (id) => {
  return request.post(ENDPOINTS.ARTICLES.FAVORITE(id))
}

/**
 * 取消收藏文章
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const unfavoriteArticle = (id) => {
  return request.post(ENDPOINTS.ARTICLES.UNFAVORITE(id))
}

/**
 * 获取文章收藏状态
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const getArticleFavoriteStatus = (id) => {
  return request.get(ENDPOINTS.ARTICLES.GET_FAVORITE_STATUS(id))
}

/**
 * 分享文章
 * @param {Object} data - 分享数据
 * @returns {Promise}
 */
export const shareArticle = (data) => {
  return request.post(ENDPOINTS.ARTICLES.SHARE, data)
}