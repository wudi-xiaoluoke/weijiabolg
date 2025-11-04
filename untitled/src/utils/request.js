import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from './auth'
import { useAuthStore } from '../store/modules/auth'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
    config => {
      // 从本地存储获取token
      const token = getToken()
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
      return config
    },
    error => {
      console.error('请求错误:', error)
      return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
      const res = response.data
      // 直接返回响应数据（后端返回格式：{ code: 200, data: ... } 或 { status: "SUCCESS", data: ... }）
      return res
    },
    error => {
      if (error.response) {
        const { status, data } = error.response

        switch (status) {
          case 401:
            // 未授权，清除token并跳转到登录页
            ElMessage.error('请重新登录')
            const authStore = useAuthStore()
            authStore.clearAuthData()

            // 保存当前页面路径，用于登录后重定向
            const currentPath = encodeURIComponent(window.location.pathname + window.location.search)
            setTimeout(() => {
              window.location.href = `/login?redirect=${currentPath}`
            }, 1000)
            break
          case 403:
            ElMessage.error('没有权限访问')
            break
          case 404:
            ElMessage.error('请求的资源不存在')
            break
          case 500:
            ElMessage.error('服务器错误')
            break
          default:
            ElMessage.error(data?.message || '请求失败')
        }
      } else if (error.request) {
        ElMessage.error('网络错误，请检查您的网络连接')
      } else {
        ElMessage.error(error.message || '请求失败')
      }

      return Promise.reject(error)
    }
)

// 默认导出（核心：与comment.js的导入匹配）
export default service