<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <header class="app-header">
      <div class="container header-content">
        <div class="logo">
          <router-link to="/" class="logo-link">
            <span class="logo-text">技术博客</span>
          </router-link>
        </div>
        
        <!-- 桌面导航 -->
        <nav class="main-nav">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/category" class="nav-item">分类</router-link>
          <router-link to="/tags" class="nav-item">标签</router-link>
        </nav>
        
        <!-- 用户操作区 -->
        <div class="user-actions">
          <ThemeSwitcher class="theme-switch-btn" />
          <MusicPlayer class="music-player-mini" />
          <div v-if="authStore.isAuthenticated || authStore.user" class="authenticated-actions">
            <router-link to="/article/edit" class="btn btn-primary btn-sm write-btn">
              <i class="el-icon-edit" /> 写文章
            </router-link>
            <div class="user-dropdown" ref="userDropdownRef">
              <button 
                class="user-avatar-btn"
                @click="toggleUserDropdown"
                @keydown.escape="closeUserDropdown"
                @keydown.tab="closeUserDropdown"
              >
                <img 
                  :src="authStore.user?.avatar || '/default-avatar.svg'" 
                  alt="用户头像" 
                  class="user-avatar"
                />
              </button>
              <div class="dropdown-menu" :class="{ open: showUserDropdown }"
                   @click.stop>
                <router-link to="/profile" class="dropdown-item">
                  <i class="el-icon-user" /> 个人信息
                </router-link>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item danger" @click="handleLogout">
                  <i class="el-icon-switch-button" /> 退出登录
                </div>
              </div>
            </div>
          </div>
          <div v-else class="guest-actions">
            <router-link to="/login" class="btn btn-outline btn-sm">登录</router-link>
            <router-link to="/register" class="btn btn-primary btn-sm">注册</router-link>
          </div>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <button class="menu-toggle"
                @click="toggleMobileMenu"
                aria-label="菜单">
          <i class="el-icon-menu" />
        </button>
      </div>
      <!-- 移动端导航菜单 -->
      <nav class="mobile-nav" :class="{ open: showMobileMenu }">
        <div class="mobile-nav-content">
          <router-link to="/" class="mobile-nav-item"
                    @click="closeMobileMenu">首页</router-link>
          <router-link to="/category" class="mobile-nav-item"
                    @click="closeMobileMenu">分类</router-link>
          <router-link to="/tags" class="mobile-nav-item"
                    @click="closeMobileMenu">标签</router-link>
          <div v-if="authStore.isAuthenticated || authStore.user">
            <router-link to="/article/edit" class="mobile-nav-item"
                      @click="closeMobileMenu">写文章</router-link>
            <router-link to="/profile" class="mobile-nav-item"
                      @click="closeMobileMenu">个人中心</router-link>
          </div>
          <div v-else class="mobile-auth">
            <router-link to="/login" class="btn btn-outline btn-block"
                      @click="closeMobileMenu">登录</router-link>
            <router-link to="/register" class="btn btn-primary btn-block"
                      @click="closeMobileMenu">注册</router-link>
          </div>
        </div>
      </nav>
    </header>
    
    <!-- 主内容区 -->
    <main class="main-container">
      <div class="container">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in" appear>
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="app-footer">
      <div class="container footer-content">
        <div class="footer-info">
          <p class="copyright">© {{ new Date().getFullYear() }} 技术博客. 保留所有权利。</p>
          <div class="footer-links">
            <a href="#" class="footer-link">关于我们</a>
            <a href="#" class="footer-link">隐私政策</a>
            <a href="#" class="footer-link">联系方式</a>
          </div>
        </div>
      </div>
    </footer>
    
    <!-- 全局加载遮罩 -->
    <div class="global-loading" v-if="globalLoading">
      <el-spinner size="large" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, provide, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from './store/modules/auth'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import MusicPlayer from './components/MusicPlayer.vue'

const authStore = useAuthStore()
const router = useRouter()
const showUserDropdown = ref(false)
const showMobileMenu = ref(false)
const userDropdownRef = ref(null)
const globalLoading = ref(false)

// 提供全局加载状态
provide('globalLoading', globalLoading)

// 切换用户下拉菜单
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
  console.log('下拉菜单状态:', showUserDropdown.value)
  // 调试：确保下拉菜单元素存在
  const dropdown = document.querySelector('.dropdown-menu')
  if (dropdown) {
    console.log('下拉菜单元素存在:', dropdown)
    console.log('当前显示状态:', dropdown.style.display)
  }
}

// 关闭用户下拉菜单
const closeUserDropdown = () => {
  showUserDropdown.value = false
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  document.body.style.overflow = showMobileMenu.value ? 'hidden' : 'auto'
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  showMobileMenu.value = false
  document.body.style.overflow = 'auto'
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await authStore.logout()
    closeUserDropdown()
    ElMessage.success('退出登录成功')
    router.push('/')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败，请稍后重试')
  }
}

// 处理点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target)) {
    closeUserDropdown()
  }
}

// 滚动处理
const handleScroll = () => {
  const header = document.querySelector('.app-header')
  if (window.scrollY > 50) {
    header.classList.add('scrolled')
  } else {
    header.classList.remove('scrolled')
  }
}

// 定义指令函数
const defineDirective = (name, definition) => {
  const app = getCurrentInstance().appContext.app
  if (app) {
    app.directive(name, definition)
  }
}

// 点击外部指令
defineDirective('click-outside', {
  mounted(el, binding) {
    const handleClickOutside = (event) => {
      if (!el.contains(event.target)) {
        binding.value()
      }
    }
    document.addEventListener('click', handleClickOutside)
    el._clickOutsideHandler = handleClickOutside
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutsideHandler)
  }
})

// 响应式显示指令
defineDirective('show', {
  mounted(el, binding) {
    const breakpoint = binding.arg || 'desktop'
    const breakpoints = {
      mobile: 768,
      tablet: 992,
      desktop: 1200
    }
    
    const updateDisplay = () => {
      if (window.innerWidth < breakpoints[breakpoint]) {
        el.style.display = 'none'
      } else {
        el.style.display = ''
      }
    }
    
    updateDisplay()
    window.addEventListener('resize', updateDisplay)
    el._resizeHandler = updateDisplay
  },
  unmounted(el) {
    window.removeEventListener('resize', el._resizeHandler)
  }
})

// 提供全局主题切换功能
const toggleTheme = () => {
  const themeSwitcher = document.querySelector('.theme-switcher')?.__vueParentComponent
  if (themeSwitcher && themeSwitcher.exposed?.toggleTheme) {
    themeSwitcher.exposed.toggleTheme()
  }
}

provide('toggleTheme', toggleTheme)

onMounted(async () => {
    // 应用启动时检查登录状态
    try {
      await authStore.initializeAuth()
      await authStore.checkLoginStatus()
      
      // 开发环境快速测试用户登录状态
      if (import.meta.env.DEV) {
        // 为了测试用户头像下拉菜单，临时设置模拟用户信息
        if (!authStore.isAuthenticated) {
          authStore.user = {
            id: '1',
            username: '测试用户',
            avatar: '/default-avatar.svg'
          }
        }
      }
    } catch (error) {
      console.error('初始化认证状态失败:', error)
    }
    
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', handleScroll)
  })

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 全局CSS变量定义 */
:root {
  --primary-color: #1890ff;
  --primary-hover: #40a9ff;
  --danger-color: #f56c6c;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --border-color: #dcdfe6;
  --border-light: #e4e7ed;
  --bg-color: #ffffff;
  --bg-hover: #f5f7fa;
  --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
  --border-radius: 6px;
  --transition-base: all 0.3s ease;
}

/* 暗黑主题CSS变量 */
[data-theme="dark"] {
  --primary-color: #40a9ff;
  --primary-hover: #66b1ff;
  --danger-color: #f78989;
  --text-primary: #e6e6e6;
  --text-regular: #b3b3b3;
  --text-secondary: #8c8c8c;
  --border-color: #434343;
  --border-light: #303030;
  --bg-color: #181818;
  --bg-hover: #252525;
  --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* 基础容器样式 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  color: var(--text-primary);
  transition: var(--transition-base);
}

/* 容器样式 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 导航栏样式 */
.app-header {
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: var(--transition-base);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

/* 滚动效果 */
.app-header.scrolled {
  box-shadow: var(--shadow-base);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .app-header.scrolled {
  background-color: rgba(24, 24, 24, 0.95);
}

/* Logo样式 */
.logo {
  font-size: 24px;
  font-weight: bold;
}

.logo-link {
  color: var(--primary-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: var(--transition-base);
}

.logo-link:hover {
  color: var(--primary-hover);
}

/* 导航样式 */
.main-nav {
  display: flex;
  gap: 24px;
}

.nav-item {
  color: var(--text-regular);
  text-decoration: none;
  padding: 8px 0;
  position: relative;
  transition: var(--transition-base);
  font-size: 15px;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: var(--primary-color);
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.nav-item:hover::after,
.nav-item.router-link-active::after {
  width: 100%;
}

/* 用户操作区 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.authenticated-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.write-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 用户下拉菜单 */
.user-dropdown {
  position: relative;
  z-index: 1000;
}

.user-avatar-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.user-avatar-btn:hover .user-avatar {
  border-color: #1890ff;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 110px;
  visibility: hidden;
  opacity: 0;
  transform: translate(-50%, -5px);
  transition: visibility 0.2s, opacity 0.2s, transform 0.2s;
}

.dropdown-menu.open {
  visibility: visible;
  opacity: 1;
  transform: translate(-50%, 0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #333;
  text-decoration: none;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item i {
  margin-right: 8px;
}

.dropdown-item.danger {
  color: #ff4d4f;
}

.dropdown-item.danger:hover {
  background-color: #fff2f0;
}

.dropdown-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 4px 0;
}

/* 游客操作 */
.guest-actions {
  display: flex;
  gap: 8px;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-regular);
  background-color: var(--bg-color);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  min-width: 60px;
}

.btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
  color: #fff;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-outline {
  background-color: transparent;
  border-color: var(--border-color);
  color: var(--text-regular);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-block {
  display: block;
  width: 100%;
}

/* 移动端菜单 */
.menu-toggle {
  display: none;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 24px;
  color: var(--text-primary);
  padding: 8px;
  border-radius: var(--border-radius);
  transition: var(--transition-base);
}

.menu-toggle:hover {
  background-color: var(--bg-hover);
}

.mobile-nav {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-color);
  transform: translateX(100%);
  transition: var(--transition-base);
  z-index: 999;
  overflow-y: auto;
}

.mobile-nav.open {
  transform: translateX(0);
}

.mobile-nav-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-nav-item {
  color: var(--text-primary);
  text-decoration: none;
  padding: 12px 16px;
  font-size: 16px;
  border-radius: var(--border-radius);
  transition: var(--transition-base);
}

.mobile-nav-item:hover {
  background-color: var(--bg-hover);
  color: var(--primary-color);
}

.mobile-auth {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

/* 主内容区 */
.main-container {
  flex: 1;
  padding: 40px 0;
}

/* 页脚 */
.app-footer {
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-light);
  padding: 32px 0;
  transition: var(--transition-base);
}

.footer-content {
  text-align: center;
}

.footer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.copyright {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition-base);
}

.footer-link:hover {
  color: var(--primary-color);
}

/* 全局加载遮罩 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .header-content {
    height: 56px;
  }
  
  .main-nav {
    display: none;
  }
  
  .menu-toggle {
    display: block;
  }
  
  .user-actions {
    gap: 8px;
  }
  
  .write-btn {
    display: none;
  }
  
  .guest-actions {
    display: none;
  }
  
  .mobile-nav {
    top: 56px;
  }
  
  .main-container {
    padding: 24px 0;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 8px;
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-hover);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* Firefox 滚动条样式 */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-hover);
}
</style>