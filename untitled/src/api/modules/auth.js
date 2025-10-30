import request from '../../utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getProfile() {
  return request({
    url: '/users/me',
    method: 'get'
  })
}

// 获取用户信息（根据用户功能模块文档）
export function getUserInfo() {
  return request({
    url: '/users/me',
    method: 'get'
  })
}

// 更新用户信息
export function updateProfile(data) {
  return request({
    url: '/users/me',
    method: 'put',
    data
  })
}

// 更新密码
export function updatePassword(data) {
  return request({
    url: '/auth/password',
    method: 'put',
    data
  })
}

// 登出
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

// 发送重置密码链接
export function sendResetPasswordLink(data) {
  return request({
    url: '/auth/forgot-password',
    method: 'post',
    data
  })
}

// 重置密码
export function resetPassword(data) {
  return request({
    url: '/auth/reset-password',
    method: 'post',
    data
  })
}