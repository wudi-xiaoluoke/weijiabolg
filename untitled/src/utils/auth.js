import { setStorage, getStorage, removeStorage } from './storage'

const TOKEN_KEY = 'blog_token'

// 设置token
export function setToken(token) {
  setStorage(TOKEN_KEY, token)
}

// 获取token
export function getToken() {
  return getStorage(TOKEN_KEY)
}

// 移除token
export function removeToken() {
  removeStorage(TOKEN_KEY)
}

// 检查token是否存在且有效
export function isValidToken() {
  const token = getToken()
  if (!token) return false
  
  try {
    // 简单的token验证，可以根据实际情况扩展
    // 例如验证token是否过期等
    return token.length > 0
  } catch (error) {
    return false
  }
}