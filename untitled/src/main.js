import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import './styles/animations.css'
import { useAuthStore } from './store/modules/auth'

const app = createApp(App)
const pinia = createPinia()

// 主题切换支持
const setupTheme = () => {
  // 从localStorage获取保存的主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme)
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } else {
    // 自动检测系统主题
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.classList.add('dark')
    }
  }
}

// 初始化主题
setupTheme()

// Element Plus暗黑主题配置
const elementPlusOptions = {
  size: 'default',
  zIndex: 3000
}

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, elementPlusOptions)

// 监听主题变化事件，同步更新主题
window.addEventListener('theme-changed', (event) => {
  const { theme } = event.detail
  document.documentElement.setAttribute('data-theme', theme)
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

// 初始化认证状态并挂载应用
const initApp = async () => {
  const authStore = useAuthStore()
  try {
    // 在应用挂载前初始化认证状态
    await authStore.initializeAuth()
    console.log('认证状态初始化完成，准备挂载应用')
    // 认证状态初始化完成后再挂载应用
    app.mount('#app')
  } catch (error) {
    console.error('初始化认证状态失败:', error)
    // 即使认证初始化失败，也要挂载应用
    app.mount('#app')
  }
}

initApp()
