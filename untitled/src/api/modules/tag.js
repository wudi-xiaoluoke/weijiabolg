import request from '../../utils/request'
import { ENDPOINTS } from '../config'

/**
 * 获取标签列表
 * @param {Object} params 查询参数
 * @param {boolean} params.includeArticles 是否包含文章数量
 * @returns {Promise}
 */
export const getTags = (params = {}) => {
  return request.get(ENDPOINTS.TAG.LIST, { params })
}

/**
 * 获取标签详情
 * @param {number} id 标签ID
 * @returns {Promise}
 */
export const getTagById = (id) => {
  return request.get(ENDPOINTS.TAG.DETAIL(id))
}

/**
 * 创建标签
 * @param {Object} data 标签数据
 * @param {string} data.name 标签名称
 * @returns {Promise}
 */
export const createTag = (data) => {
  return request.post(ENDPOINTS.TAG.CREATE, data)
}

/**
 * 更新标签
 * @param {number} id 标签ID
 * @param {Object} data 标签数据
 * @returns {Promise}
 */
export const updateTag = (id, data) => {
  return request.put(ENDPOINTS.TAG.UPDATE(id), data)
}

/**
 * 删除标签
 * @param {number} id 标签ID
 * @returns {Promise}
 */
export const deleteTag = (id) => {
  return request.delete(ENDPOINTS.TAG.DELETE(id))
}

/**
 * 获取标签下的文章列表
 * @param {number} id 标签ID
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export const getArticlesByTag = (id, params = {}) => {
  return request.get(ENDPOINTS.TAG.GET_ARTICLES(id), { params })
}

/**
 * 获取热门标签
 * @param {number} limit 数量限制
 * @returns {Promise}
 */
export const getPopularTags = (limit = 10) => {
  return request.get(ENDPOINTS.TAG.POPULAR, { params: { limit } })
}