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
  async function login(userName, passWord) {
    isLoading.value = true
    error.value = null
    try {
      // 安全地传递参数，避免变量名冲突
      const loginData = { username: userName, password: passWord }
      const response = await userAPI.login(loginData)
      
      // 根据后端API文档，返回格式是 { status: "SUCCESS", data: "JWT Token" }
      const token = response.data || ''
      
      // 保存token
      if (token) {
        setToken(token)
      }
      
      // 登录成功后立即调用fetchUserProfile获取用户信息
      await fetchUserProfile()
      
      return response
    } catch (err) {
      error.value = err.response?.data?.message || '登录失败'
      throw err
    } finally {
      isLoading.value = false
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
      const response = await userAPI.getCurrentUser()
      // 根据后端API文档，返回格式是 { status: "SUCCESS", data: 用户信息对象 }
      user.value = response.data || {}
      // 确保用户对象有必要的字段
      if (!user.value.avatar) {
        user.value.avatar = '/images/生成用户默认头像.png'
      }
      return user.value
    } catch (err) {
      console.error('获取用户信息失败:', err)
      // 清除token并跳转到登录页
      logout()
      throw err
    }
  }
  
  // 获取用户信息（兼容旧方法）
  async function getProfile() {
    return fetchUserProfile()
  }

  // 检查登录状态
  async function checkLoginStatus() {
    const token = getToken()
    if (!token || !isValidToken()) {
      return false
    }
    
    if (!user.value) {
      try {
        await fetchUserProfile()
        return true
      } catch (err) {
        console.error('检查登录状态失败:', err)
        clearAuthData()
        return false
      }
    }
    return true
  }

  // 初始化认证状态
  async function initializeAuth() {
    if (isInitialized.value) return
    
    isLoading.value = true
    try {
      await checkLoginStatus()
    } catch (err) {
      console.error('初始化认证状态失败:', err)
    } finally {
      isInitialized.value = true
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