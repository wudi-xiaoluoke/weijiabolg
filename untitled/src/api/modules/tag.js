import request from '../../utils/request'

/**
 * 获取标签列表
 * @returns {Promise}
 */
export const getTags = () => {
  return request.get('/tags')
}

/**
 * 获取标签详情
 * @param {number} id - 标签ID
 * @returns {Promise}
 */
export const getTagById = (id) => {
  return request.get(`/tags/${id}`)
}

/**
 * 创建标签
 * @param {Object} data - 标签数据
 * @param {string} data.name - 标签名称
 * @returns {Promise}
 */
export const createTag = (data) => {
  return request.post('/tags', data)
}

/**
 * 更新标签
 * @param {number} id - 标签ID
 * @param {Object} data - 标签数据
 * @returns {Promise}
 */
export const updateTag = (id, data) => {
  return request.put(`/api/tags/${id}`, data)
}

/**
 * 删除标签
 * @param {number} id - 标签ID
 * @returns {Promise}
 */
export const deleteTag = (id) => {
  return request.delete(`/api/tags/${id}`)
}

/**
 * 获取标签下的文章列表
 * @param {number} id - 标签ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getArticlesByTag = (id, params = {}) => {
  return request.get(`/api/tags/${id}/articles`, { params })
}