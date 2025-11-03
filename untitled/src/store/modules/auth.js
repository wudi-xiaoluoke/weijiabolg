import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userAPI } from '../../api/index'
import { setToken, getToken, removeToken, isValidToken } from '../../utils/auth'
import { useSocialStore } from './social'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !!getToken() && isValidToken())
  const userRole = computed(() => user.value?.role || 0)
  const isAdmin = computed(() => userRole.value === 1)
  const isAuthor = computed(() => user.value?.role >= 1 || user.value?.canWriteArticles)
  const userPermissions = computed(() => user.value?.permissions || [])

  // Actions
  async function login(username, password) {
    // 设置加载状态并清除之前的错误
    isLoading.value = true
    error.value = null
    
    try {
      console.log('开始登录流程，用户名:', username)
      
      // 参数验证
      if (!username || !password) {
        throw new Error('用户名和密码不能为空')
      }
      
      // 调用登录API
      const response = await userAPI.login({ username, password })
      
      // 验证响应
      if (!response) {
        throw new Error('登录请求失败，未收到响应')
      }
      
      // 提取token（兼容不同格式的响应）
      const token = extractTokenFromResponse(response)
      
      // 验证并保存token
      if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new Error('登录响应中未包含有效的token')
      }
      
      // 保存token到本地存储
      setToken(token)
      console.log('Token已成功保存')
      
      // 并行获取用户信息，但不阻塞登录流程
      const profilePromise = fetchUserProfile().catch(profileError => {
        console.warn('登录成功，但获取用户信息时发生错误:', profileError.message)
        // 记录错误但不抛出，允许登录流程继续
      })
      
      // 等待用户信息获取完成后再返回
      // 这样确保在登录成功回调中，用户信息已经准备好
      await profilePromise
      
      console.log('登录流程完成，用户信息已加载')
      return response
      
    } catch (err) {
      // 错误处理
      const errorMessage = processLoginError(err)
      error.value = errorMessage
      console.error('登录失败:', errorMessage, '详细错误:', err)
      throw err // 重新抛出错误，让组件层可以处理
    } finally {
      // 确保无论成功失败都关闭加载状态
      isLoading.value = false
    }
  }
  
  // 从响应中提取token的辅助函数
  function extractTokenFromResponse(response) {
    // 支持多种响应格式
    if (typeof response === 'string') {
      return response
    }
    
    // 常见的token字段名称
    const tokenFields = ['token', 'accessToken', 'access_token', 'auth_token']
    
    for (const field of tokenFields) {
      if (response[field]) {
        return response[field]
      }
    }
    
    // 如果data字段存在，检查其中的token
    if (response.data) {
      for (const field of tokenFields) {
        if (response.data[field]) {
          return response.data[field]
        }
      }
      // 直接返回data作为最后的尝试
      return response.data
    }
    
    return null
  }
  
  // 处理登录错误的辅助函数
  function processLoginError(error) {
    // 网络错误
    if (!error.response) {
      return '网络连接失败，请检查您的网络设置'
    }
    
    // 服务器返回的错误
    const status = error.response.status
    const data = error.response.data
    
    // 根据不同的状态码提供友好的错误信息
    switch (status) {
      case 401:
        return data?.message || data?.error || '用户名或密码错误'
      case 403:
        return data?.message || '账户已被禁用'
      case 429:
        return data?.message || '登录尝试次数过多，请稍后再试'
      case 500:
        return data?.message || '服务器错误，请稍后再试'
      default:
        return data?.message || data?.error || `登录失败 (${status})`
    }
  }

  async function register(userData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await userAPI.register(userData)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || '注册失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 获取用户信息
  async function fetchUserProfile() {
    try {
      console.log('开始获取用户信息...')
      
      // 检查是否有token
      const token = getToken()
      if (!token || !isValidToken()) {
        console.warn('没有有效的token，无法获取用户信息')
        user.value = null
        return null
      }
      
      // 调用API获取用户信息
      const response = await userAPI.getCurrentUser()
      
      console.log('获取用户信息API响应:', response)
      
      // 验证响应数据
      if (!response || typeof response !== 'object') {
        throw new Error('获取到无效的用户信息数据')
      }
      
      // 规范化用户数据结构
      const normalizedUserData = normalizeUserData(response)
      
      // 验证必要字段
      if (!normalizedUserData.id || !normalizedUserData.username) {
        throw new Error('用户信息缺少必要字段')
      }
      
      // 深度复制确保响应式更新
      user.value = { ...normalizedUserData }
      console.log('用户信息更新成功:', user.value.username)
      
      return user.value
    } catch (err) {
      console.error('获取用户信息失败:', err.message)
      
      // 出错时清除用户状态但保留token，让用户可以尝试重新登录
      // 只有在确定token无效时才清除token
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn('用户认证已过期，清除登录状态')
        removeToken()
      }
      
      // 重置用户状态
      user.value = null
      
      // 返回null而不是抛出错误，避免中断调用流程
      return null
    }
  }
  
  // 规范化用户数据的辅助函数
  function normalizeUserData(rawData) {
    // 处理嵌套data字段的情况
    const sourceData = rawData.data || rawData
    
    return {
      // 基本信息
      id: sourceData.id || sourceData._id || '',
      username: sourceData.username || '',
      nickname: sourceData.nickname || sourceData.displayName || sourceData.username || '',
      email: sourceData.email || '',
      
      // 个人资料信息
      avatar: sourceData.avatar || sourceData.avatarUrl || '/images/生成用户默认头像.png',
      bio: sourceData.bio || sourceData.description || '',
      website: sourceData.website || '',
      location: sourceData.location || '',
      
      // 社交信息
      socialLinks: sourceData.socialLinks || sourceData.social || {},
      
      // 权限信息
      role: sourceData.role || sourceData.userRole || 0,
      canWriteArticles: sourceData.canWriteArticles || false,
      permissions: Array.isArray(sourceData.permissions) ? sourceData.permissions : [],
      
      // 额外信息
      createdAt: sourceData.createdAt || null,
      updatedAt: sourceData.updatedAt || null,
      lastLogin: sourceData.lastLogin || null
    }
  }
  
  // 获取用户信息（兼容旧方法）
  async function getProfile() {
    return fetchUserProfile()
  }

  // 检查登录状态
  async function checkLoginStatus() {
    try {
      console.log('开始检查登录状态...')
      
      // 首先检查是否有token以及token是否有效
      const token = getToken()
      if (!token || token.trim() === '') {
        console.log('没有找到登录token')
        return false
      }
      
      // 验证token有效性
      if (!isValidToken()) {
        console.log('token无效或已过期')
        removeToken()
        return false
      }
      
      // 如果用户信息已经加载，则认为已登录
      if (user.value && user.value.id) {
        console.log('用户信息已存在，登录状态有效')
        return true
      }
      
      // 如果用户信息不存在，则尝试从服务器获取
      console.log('用户信息不存在，尝试获取...')
      const profileResult = await fetchUserProfile()
      
      // 如果成功获取到用户信息，则认为已登录
      if (profileResult && profileResult.id) {
        console.log('成功获取用户信息，登录状态有效')
        return true
      } else {
        console.log('无法获取有效用户信息，清除登录状态')
        // 清除token和用户信息
        clearAuthData()
        return false
      }
    } catch (err) {
      console.error('检查登录状态时发生错误:', err)
      // 发生错误时清除认证数据
      clearAuthData()
      return false
    }
  }

  // 初始化认证状态
  async function initializeAuth() {
    // 防止重复初始化
    if (isInitialized.value) {
      console.log('认证状态已初始化，跳过')
      return
    }
    
    console.log('开始初始化认证状态...')
    isLoading.value = true
    
    try {
      // 检查登录状态
      await checkLoginStatus()
      
      // 设置初始化标志
      isInitialized.value = true
      console.log('认证状态初始化完成')
    } catch (err) {
      console.error('初始化认证状态失败:', err)
      // 即使出错也要标记为已初始化，避免重复尝试
      isInitialized.value = true
      // 确保状态被重置
      user.value = null
    } finally {
      // 确保无论如何都关闭加载状态
      isLoading.value = false
    }
  }

  // 检查用户是否有权限
  function hasPermission(permission) {
    // 管理员拥有所有权限
    if (isAdmin.value) return true
    
    // 检查用户是否有特定权限
    return userPermissions.value.includes(permission)
  }

  // 检查用户是否有多个权限中的任意一个
  function hasAnyPermission(permissions) {
    // 管理员拥有所有权限
    if (isAdmin.value) return true
    
    // 检查用户是否有任意一个权限
    return permissions.some(permission => userPermissions.value.includes(permission))
  }

  // 检查用户是否是资源所有者
  function isResourceOwner(resourceUserId) {
    return user.value && user.value.id === resourceUserId
  }

  // 登出
  async function logout() {
    try {
      // 根据后端API文档，登出功能由前端处理
      await userAPI.logout()
    } catch (err) {
      console.error('登出API调用失败:', err)
      // 忽略登出API错误，继续清除本地数据
    } finally {
      // 先清除认证数据
      clearAuthData()
      
      // 清除社交数据
      const socialStore = useSocialStore()
      socialStore.resetAll()
    }
  }
  
  // 更新用户信息
  async function updateUserProfile(userData) {
    try {
      const response = await userAPI.updateUser(userData)
      // 根据后端API文档，返回格式是 { status: "SUCCESS", data: 更新后的用户信息 }
      user.value = response.data || {}
      return response
    } catch (err) {
      console.error('更新用户信息失败:', err)
      error.value = err.response?.data?.message || '更新失败'
      throw err
    }
  }
  
  // 更新密码
  async function updatePassword(passwordData) {
    try {
      // 转换参数格式以匹配后端API
      const formattedData = {
        oldPassword: passwordData.currentPassword || passwordData.oldPassword,
        newPassword: passwordData.newPassword
      }
      const response = await userAPI.changePassword(formattedData)
      return response
    } catch (err) {
      console.error('更新密码失败:', err)
      error.value = err.response?.data?.message || '更新密码失败'
      throw err
    }
  }
  
  // 发送重置密码链接
  async function sendResetPasswordLink(emailData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authAPI.sendResetPasswordLink(emailData)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || '发送重置链接失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 重置密码
  async function resetPassword(resetData) {
    isLoading.value = true
    error.value = null
    try {
      const response = await authAPI.resetPassword(resetData)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || '重置密码失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // 清除认证数据
  function clearAuthData() {
    user.value = null
    removeToken()
  }
  
  // 清除错误信息
  function clearError() {
    error.value = null
  }

  return {
    user,
    isLoading,
    error,
    isInitialized,
    isAuthenticated,
    userRole,
    isAdmin,
    isAuthor,
    userPermissions,
    login,
    register,
    getProfile,
    fetchUserProfile,
    checkLoginStatus,
    initializeAuth,
    logout,
    updateUserProfile,
    updatePassword,
    sendResetPasswordLink,
    resetPassword,
    clearAuthData,
    clearError,
    hasPermission,
    hasAnyPermission,
    isResourceOwner
  }
})