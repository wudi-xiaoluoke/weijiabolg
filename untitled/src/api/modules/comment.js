// 默认导入request（与request.js的默认导出匹配）
import request from '../../utils/request'
import { ENDPOINTS } from '../config'

/**
 * 获取文章评论列表
 * @param {number} articleId 文章ID
 * @param {number} page 页码（默认1）
 * @param {number} pageSize 每页条数（默认10）
 * @returns {Promise}
 */
export function getArticleComments(articleId, page = 1, pageSize = 10) {
  return request.get(ENDPOINTS.COMMENT.LIST, {
    params: { articleId, page, pageSize } // 正确传递查询参数
  })
}

/**
 * 发布评论/回复
 * @param {Object} data 评论数据
 * @param {number} data.articleId 文章ID
 * @param {string} data.content 评论内容
 * @param {number} [data.parentId] 父评论ID（可选）
 * @param {number} [data.toUserId] 回复用户ID（可选）
 * @returns {Promise}
 */
export function createComment(data) {
  return request.post(ENDPOINTS.COMMENT.CREATE, data)
}

/**
 * 删除评论
 * @param {number} commentId 评论ID
 * @returns {Promise}
 */
export function deleteComment(commentId) {
  return request.delete(ENDPOINTS.COMMENT.DELETE(commentId))
}

/**
 * 点赞评论
 * @param {number} commentId 评论ID
 * @returns {Promise}
 */
export function likeComment(commentId) {
  return request.post(ENDPOINTS.COMMENT.LIKE(commentId))
}

/**
 * 取消点赞评论
 * @param {number} commentId 评论ID
 * @returns {Promise}
 */
export function unlikeComment(commentId) {
  return request.post(ENDPOINTS.COMMENT.UNLIKE(commentId))
}

/**
 * 获取评论点赞状态
 * @param {number} commentId 评论ID
 * @returns {Promise}
 */
export function getCommentLikeStatus(commentId) {
  return request.get(ENDPOINTS.COMMENT.GET_LIKE_STATUS(commentId))
}