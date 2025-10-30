import request from '../../utils/request'

// 更新文章点赞状态
export function updateLikeStatus(articleId, liked) {
  return request({
    url: `/api/articles/${articleId}/like-status`,
    method: 'put',
    data: { liked }
  })
}

// 获取文章点赞状态
export function getArticleLikeStatus(articleId) {
  return request({
    url: `/articles/${articleId}/like/status`,
    method: 'get'
  })
}

// 收藏文章
export function favoriteArticle(articleId) {
  return request({
    url: `/articles/${articleId}/favorite`,
    method: 'post'
  })
}

// 取消收藏文章
export function unfavoriteArticle(articleId) {
  return request({
    url: `/articles/${articleId}/unfavorite`,
    method: 'post'
  })
}

// 获取文章收藏状态
export function getArticleFavoriteStatus(articleId) {
  return request({
    url: `/articles/${articleId}/favorite/status`,
    method: 'get'
  })
}

// 分享文章
export function shareArticle(data) {
  return request({
    url: '/articles/share',
    method: 'post',
    data
  })
}

// 关注用户
export function followUser(userId) {
  return request({
    url: `/users/${userId}/follow`,
    method: 'post'
  })
}

// 取消关注用户
export function unfollowUser(userId) {
  return request({
    url: `/users/${userId}/unfollow`,
    method: 'post'
  })
}

// 获取用户关注状态
export function getFollowStatus(userId) {
  return request({
    url: `/users/${userId}/follow/status`,
    method: 'get'
  })
}

// 获取用户的粉丝列表
export function getUserFollowers(userId, params) {
  return request({
    url: `/users/${userId}/followers`,
    method: 'get',
    params
  })
}

// 获取用户的关注列表
export function getUserFollowing(userId, params) {
  return request({
    url: `/users/${userId}/following`,
    method: 'get',
    params
  })
}

// 获取用户的收藏列表
export function getUserFavorites(params) {
  return request({
    url: '/user/favorites',
    method: 'get',
    params
  })
}

// 获取用户的点赞列表
export function getUserLikes(params) {
  return request({
    url: '/user/likes',
    method: 'get',
    params
  })
}