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
  },
  withCredentials: true // 允许携带Cookie
})

console.log('=== API请求配置 ===')
console.log('API基础URL:', import.meta.env.VITE_API_BASE_URL || '/api')
console.log('是否使用模拟数据:', false, '(已配置使用真实后端数据)')

// 请求拦截器
service.interceptors.request.use(
    config => {
      // 从本地存储获取token
      const token = getToken()
      console.log('🚀 发送请求:', config.method?.toUpperCase(), config.url)
      console.log('🌐 完整URL:', config.baseURL + config.url)
      console.log('📋 请求参数:', config.params || config.data || '无')
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
        console.log('🔑 已添加认证Token')
      } else {
        console.log('🔓 未添加认证Token')
      }
      
      return config
    },
    error => {
      console.error('❌ 请求拦截器错误:', error.message)
      return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
      console.log('✅ 收到响应:', response.config?.url || '未知URL')
      console.log('✅ 响应状态码:', response.status)
      
      // 检查响应数据格式
      const res = response.data
      if (res) {
        console.log('✅ 响应数据格式:', typeof res)
        // 如果是对象，打印键结构
        if (typeof res === 'object') {
          console.log('✅ 响应数据键:', Object.keys(res).join(', '))
        }
      }
      
      return res
    },
    error => {
      console.error('❌ 请求失败:', error.config?.url || '未知URL')
      console.error('❌ 错误类型:', error.message)
      
      if (error.response) {
        console.error('❌ 响应错误状态码:', error.response.status)
        console.error('❌ 响应错误数据:', error.response.data)
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
        console.error('❌ 网络错误详情:', error.request)
        console.error('❌ 请确认后端服务是否运行在:', import.meta.env.VITE_API_BASE_URL)
        ElMessage.error('网络错误，请检查后端服务是否运行')
      } else {
        ElMessage.error(error.message || '请求失败')
      }

      return Promise.reject(error)
    }
)

// 默认导出（核心：与comment.js的导入匹配）
export default service