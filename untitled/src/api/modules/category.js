import request from '../../utils/request'
import { ENDPOINTS } from '../config'

/**
 * 获取分类列表
 * @param {Object} params 查询参数
 * @param {boolean} params.includeArticles 是否包含文章数量
 * @returns {Promise}
 */
export const getCategories = (params = {}) => {
  return request.get(ENDPOINTS.CATEGORY.LIST, { params })
}

/**
 * 获取分类详情
 * @param {number} id 分类ID
 * @returns {Promise}
 */
export const getCategoryById = (id) => {
  return request.get(ENDPOINTS.CATEGORY.DETAIL(id))
}

/**
 * 创建分类
 * @param {Object} data 分类数据
 * @param {string} data.name 分类名称
 * @param {number} [data.parentId] 父分类ID
 * @returns {Promise}
 */
export const createCategory = (data) => {
  return request.post(ENDPOINTS.CATEGORY.CREATE, data)
}

/**
 * 更新分类
 * @param {number} id 分类ID
 * @param {Object} data 分类数据
 * @returns {Promise}
 */
export const updateCategory = (id, data) => {
  return request.put(ENDPOINTS.CATEGORY.UPDATE(id), data)
}

/**
 * 删除分类
 * @param {number} id 分类ID
 * @returns {Promise}
 */
export const deleteCategory = (id) => {
  return request.delete(ENDPOINTS.CATEGORY.DELETE(id))
}

/**
 * 获取分类下的文章列表
 * @param {number} id 分类ID
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export const getArticlesByCategory = (id, params = {}) => {
  return request.get(ENDPOINTS.CATEGORY.GET_ARTICLES(id), { params })
}

/**
 * 获取扁平化分类列表
 * @returns {Promise}
 */
export const getFlatCategories = () => {
  return request.get(ENDPOINTS.CATEGORY.LIST)
}

/**
 * 获取子分类
 * @param {number} parentId 父分类ID
 * @returns {Promise}
 */
export const getSubCategories = (parentId) => {
  return request.get(ENDPOINTS.CATEGORY.GET_SUB_CATEGORIES(parentId))
}