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
    url: `/api/articles/${articleId}/like/status`,
    method: 'get'
  })
}

// 收藏文章
export function favoriteArticle(articleId) {
  console.log('API: favoriteArticle called with articleId:', articleId)
  const url = `/api/articles/${articleId}/favorite`
  console.log('API URL:', url)
  return request({
    url: url,
    method: 'post'
  }).then(response => {
    console.log('API: favoriteArticle response:', response)
    return response
  }).catch(error => {
    console.error('API: favoriteArticle error:', error)
    throw error
  })
}

// 取消收藏文章
export function unfavoriteArticle(articleId) {
  console.log('API: unfavoriteArticle called with articleId:', articleId)
  const url = `/api/articles/${articleId}/unfavorite`
  console.log('API URL:', url)
  return request({
    url: url,
    method: 'post'
  }).then(response => {
    console.log('API: unfavoriteArticle response:', response)
    return response
  }).catch(error => {
    console.error('API: unfavoriteArticle error:', error)
    throw error
  })
}

// 获取文章收藏状态
export function getArticleFavoriteStatus(articleId) {
  return request({
    url: `/api/articles/${articleId}/favorite/status`,
    method: 'get'
  })
}

// 分享文章
export function shareArticle(data) {
  return request({
    url: '/api/articles/share',
    method: 'post',
    data
  })
}

// 关注用户
export function followUser(userId) {
  return request({
    url: `/api/users/${userId}/follow`,
    method: 'post'
  })
}

// 取消关注用户
export function unfollowUser(userId) {
  return request({
    url: `/api/users/${userId}/unfollow`,
    method: 'post'
  })
}

// 获取用户关注状态
export function getFollowStatus(userId) {
  return request({
    url: `/api/users/${userId}/follow/status`,
    method: 'get'
  })
}

// 获取用户的粉丝列表
export function getUserFollowers(userId, params) {
  return request({
    url: `/api/users/${userId}/followers`,
    method: 'get',
    params
  })
}

// 获取用户的关注列表
export function getUserFollowing(userId, params) {
  return request({
    url: `/api/users/${userId}/following`,
    method: 'get',
    params
  })
}

// 获取用户的收藏列表
export function getUserFavorites(params) {
  return request({
    url: '/api/users/favorites',
    method: 'get',
    params
  })
}

// 获取用户的点赞列表
export function getUserLikes(params) {
  return request({
    url: '/api/users/likes',
    method: 'get',
    params
  })
}