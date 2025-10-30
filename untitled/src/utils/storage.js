// 设置本地存储
export function setStorage(key, value) {
  try {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
    localStorage.setItem(key, stringValue)
    return true
  } catch (error) {
    console.error('设置本地存储失败:', error)
    return false
  }
}

// 获取本地存储
export function getStorage(key) {
  try {
    const value = localStorage.getItem(key)
    if (value === null) return null
    
    // 尝试解析JSON
    try {
      return JSON.parse(value)
    } catch {
      // 如果不是JSON格式，则返回原始字符串
      return value
    }
  } catch (error) {
    console.error('获取本地存储失败:', error)
    return null
  }
}

// 移除本地存储
export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('移除本地存储失败:', error)
    return false
  }
}

// 清空本地存储
export function clearStorage() {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('清空本地存储失败:', error)
    return false
  }
}

// 设置会话存储
export function setSessionStorage(key, value) {
  try {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
    sessionStorage.setItem(key, stringValue)
    return true
  } catch (error) {
    console.error('设置会话存储失败:', error)
    return false
  }
}

// 获取会话存储
export function getSessionStorage(key) {
  try {
    const value = sessionStorage.getItem(key)
    if (value === null) return null
    
    // 尝试解析JSON
    try {
      return JSON.parse(value)
    } catch {
      // 如果不是JSON格式，则返回原始字符串
      return value
    }
  } catch (error) {
    console.error('获取会话存储失败:', error)
    return null
  }
}

// 移除会话存储
export function removeSessionStorage(key) {
  try {
    sessionStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('移除会话存储失败:', error)
    return false
  }
}