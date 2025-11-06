import request from '../../utils/request'

// 用户登录
export const login = (data) => {
  return request.post('/api/users/login', data)
}

// 用户注册
export const register = (data) => {
  return request.post('/api/users/register', data)
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/api/users/me')
}

// 更新用户信息
export const updateUserInfo = (data) => {
  return request.put('/api/users/me', data)
}

// 更改密码
export const changePassword = (data) => {
  return request.put('/api/users/me/password', data)
}