// 默认导入request（与request.js的默认导出匹配）
import request from '../../utils/request'

/**
 * 获取文章评论列表
 * @param articleId 文章ID
 * @param page 页码（默认1）
 * @param pageSize 每页条数（默认10）
 */
export function getArticleComments(articleId, page = 1, pageSize = 10) {
  return request.get('/api/comments', {
    params: { articleId, page, pageSize } // 正确传递查询参数
  })
}

/**
 * 发布评论/回复
 * @param data { articleId, content, parentId?, toUserId? }
 */
export function createComment(data) {
  return request.post('/api/comments', data)
}

/**
 * 删除评论
 * @param commentId 评论ID
 */
export function deleteComment(commentId) {
  return request.delete(`/api/comments/${commentId}`)
}

/**
 * 点赞评论
 * @param commentId 评论ID
 */
export function likeComment(commentId) {
  return request.post(`/api/comments/${commentId}/like`)
}