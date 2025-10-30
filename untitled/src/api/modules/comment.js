import request from '../../utils/request'

// 获取文章评论列表
export function getArticleComments(articleId, params) {
  return request({
    url: `/articles/${articleId}/comments`,
    method: 'get',
    params
  })
}

// 创建评论
export function createComment(data) {
  return request({
    url: '/comments',
    method: 'post',
    data
  })
}

// 回复评论
export function replyToComment(data) {
  return request({
    url: '/comments/reply',
    method: 'post',
    data
  })
}

// 删除评论
export function deleteComment(commentId) {
  return request({
    url: `/comments/${commentId}`,
    method: 'delete'
  })
}

// 点赞评论
export function likeComment(commentId) {
  return request({
    url: `/comments/${commentId}/like`,
    method: 'post'
  })
}

// 取消点赞评论
export function unlikeComment(commentId) {
  return request({
    url: `/comments/${commentId}/unlike`,
    method: 'post'
  })
}

// 获取评论点赞状态
export function getCommentLikeStatus(commentId) {
  return request({
    url: `/comments/${commentId}/like/status`,
    method: 'get'
  })
}

// 获取用户评论列表
export function getUserComments(params) {
  return request({
    url: '/user/comments',
    method: 'get',
    params
  })
}

// 获取评论统计
export function getArticleCommentStats(articleId) {
  return request({
    url: `/articles/${articleId}/comments/stats`,
    method: 'get'
  })
}