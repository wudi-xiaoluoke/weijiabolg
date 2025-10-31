<template>
  <div class="app-container">
    
    <!-- 全局主题切换器，固定在右上角 -->
    <div class="theme-switcher-container">
      <ThemeSwitcher />
    </div>
    
    <!-- 导航栏 -->
    <nav ref="navbar" class="navbar sticky-nav">
      <div class="container flex-between">
        <div class="logo">
          <router-link to="/">技术博客</router-link>
        </div>
        
        <!-- 导航链接 -->
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/category" class="nav-link">分类</router-link>
          <router-link to="/tags" class="nav-link">标签</router-link>
        </div>
        
        <!-- 音乐播放器和用户操作区 -->
        <div class="user-actions" v-if="authStore.isAuthenticated">
          <MusicPlayer />
          <router-link to="/article/edit" class="btn btn-primary">写文章</router-link>
          
          <!-- 管理按钮和用户菜单组合 -->
          <div class="user-menu-container">
            <router-link to="/dashboard" class="btn admin-btn" @mouseenter="showUserMenu = true">管理</router-link>
            <div class="user-menu" @mouseenter="showUserMenu = true" @mouseleave="showUserMenu = false">
              <div class="user-avatar-trigger">
                <img :src="authStore.user?.avatar || '/default-avatar.svg'" alt="用户头像" />
              </div>
              <div class="user-dropdown-menu" :class="{ 'show': showUserMenu }">
                <router-link to="/profile" class="dropdown-item">
                  <i class="el-icon-user"></i> 个人资料
                </router-link>
                <router-link to="/settings" class="dropdown-item">
                  <i class="el-icon-setting"></i> 系统设置
                </router-link>
                <div class="dropdown-item" @click="handleLogout">
                  <i class="el-icon-switch-button"></i> 退出登录
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="auth-links" v-else>
          <MusicPlayer />
          <router-link to="/login" class="btn">登录</router-link>
          <router-link to="/register" class="btn btn-primary">注册</router-link>
        </div>
      </div>
    </nav>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="container">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <keep-alive :include="['ArticleListView', 'ArticleDetailView']">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p>© {{ new Date().getFullYear() }} 技术博客. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, provide, ref } from 'vue'
import { useAuthStore } from './store/modules/auth'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import MusicPlayer from './components/MusicPlayer.vue'

const authStore = useAuthStore()
const showUserMenu = ref(false)
const navbar = ref(null)

// 应用启动时检查登录状态
onMounted(async () => {
  await authStore.checkLoginStatus()
  
  // 点击页面其他地方关闭下拉菜单
  document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu')
    if (userMenu && !userMenu.contains(e.target)) {
      showUserMenu.value = false
    }
  })
  
  // 监听滚动事件，更新导航栏样式
  const handleScroll = () => {
    if (navbar.value) {
      if (window.scrollY > 50) {
        navbar.value.classList.add('scrolled')
      } else {
        navbar.value.classList.remove('scrolled')
      }
    }
  }
  
  window.addEventListener('scroll', handleScroll)
  
  // 组件卸载时移除事件监听器
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})

// 处理退出登录
const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logout()
}

// 提供全局主题切换功能
const toggleTheme = () => {
  const themeSwitcher = document.querySelector('.theme-switcher')?.__vueParentComponent
  if (themeSwitcher && themeSwitcher.exposed?.toggleTheme) {
    themeSwitcher.exposed.toggleTheme()
  }
}

provide('toggleTheme', toggleTheme)
</script>

<style scoped>
/* Container styles */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Flex utilities */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
/* 使用CSS变量 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-base, #ffffff);
  transition: background-color 0.3s ease;
}

/* 主题切换器容器 */
.theme-switcher-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  padding: 8px;
  background-color: var(--bg-color-white, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 适配暗黑主题 */
[data-theme="dark"] .theme-switcher-container {
  background-color: var(--bg-color-dark, #181818);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.navbar {
  background-color: var(--bg-color-white, #ffffff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.logo a {
  color: var(--primary-color, #1890ff);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: var(--text-color-primary, #303133);
  text-decoration: none;
  padding: 10px 12px;
  transition: color 0.3s;
  position: relative;
  border-radius: 4px;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--primary-color, #1890ff);
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--primary-color, #1890ff);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

/* 用户菜单容器 */
.user-menu-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-btn {
  background-color: var(--bg-color-hover, #f5f7fa);
  color: var(--text-color-primary, #303133);
}

.admin-btn:hover {
  background-color: var(--bg-color-light, #ecf5ff);
  border-color: var(--primary-color, #1890ff);
  color: var(--primary-color, #1890ff);
}

[data-theme="dark"] .admin-btn {
  background-color: var(--bg-color-dark-hover, #252525);
}

[data-theme="dark"] .admin-btn:hover {
  background-color: var(--bg-color-dark-light, #1f2937);
}

/* 用户下拉菜单 */
.user-menu {
  position: relative;
}

/* 下拉菜单默认隐藏，只有在show类存在时才显示 */
.user-dropdown-menu {
  display: none;
}

.user-dropdown-menu.show {
  display: block;
}

.user-avatar-trigger {
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.user-avatar-trigger:hover {
  background-color: var(--bg-color-hover, #f5f7fa);
}

.user-avatar-trigger img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  transform: translateX(50%);
  background-color: var(--bg-color-white, #ffffff);
  border: 1px solid var(--border-color-base, #dcdfe6);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 180px;
  transform-origin: top right;
  animation: dropdown-enter-active 0.3s ease-out;
}

/* 暗黑主题适配 */
[data-theme="dark"] .user-dropdown-menu {
  background-color: var(--bg-color-dark, #181818);
  border-color: var(--border-color-dark, #434343);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: var(--text-color-primary, #303133);
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: var(--bg-color-hover, #f5f7fa);
}

/* 暗黑主题下的下拉项悬停效果 */
[data-theme="dark"] .dropdown-item:hover {
  background-color: var(--bg-color-dark-hover, #252525);
}

.dropdown-item i {
  font-size: 16px;
  color: var(--text-color-secondary, #909399);
}

/* 退出登录项样式 */
.dropdown-item:last-child {
  border-top: 1px solid var(--border-color-base, #ebeef5);
  margin-top: 4px;
  padding-top: 12px;
  color: var(--danger-color, #f56c6c);
}

[data-theme="dark"] .dropdown-item:last-child {
  border-top-color: var(--border-color-dark, #434343);
}

.dropdown-item:last-child:hover {
  background-color: var(--bg-color-danger-hover, #fef0f0);
}

[data-theme="dark"] .dropdown-item:last-child:hover {
  background-color: var(--bg-color-dark-danger-hover, #2c1a1a);
}

/* 菜单动画 */
@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.btn {
  padding: 10px 20px;
  border: 1px solid var(--border-color-base, #dcdfe6);
  border-radius: 6px;
  color: var(--text-color-regular, #606266);
  background-color: var(--bg-color-white, #ffffff);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block;
  font-size: 15px;
  min-width: 80px;
  text-align: center;
}

.btn:hover {
  border-color: var(--border-color-hover, #c0c4cc);
  color: var(--primary-color, #409eff);
}

.btn-primary {
  background-color: var(--primary-color, #1890ff);
  border-color: var(--primary-color, #1890ff);
  color: #fff;
}

.btn-primary:hover {
  background-color: var(--primary-color-hover, #40a9ff);
  border-color: var(--primary-color-hover, #40a9ff);
  color: #fff;
}

.main-content {
  flex: 1;
  padding: 40px 0;
}

.footer {
  background-color: var(--bg-color-white, #ffffff);
  padding: 24px 0;
  text-align: center;
  color: var(--text-color-secondary, #909399);
  border-top: 1px solid var(--border-color-base, #ebeef5);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* 导航栏滚动效果 */
.navbar.scrolled {
  padding: 16px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .navbar.scrolled {
  background-color: rgba(24, 24, 24, 0.95);
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .theme-switcher-container {
    top: 15px;
    right: 15px;
    padding: 6px;
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--scrollbar-bg-color, #f1f1f1);
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-color, #c1c1c1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover-color, #a8a8a8);
}

/* Firefox 滚动条样式 */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb-color, #c1c1c1) var(--scrollbar-bg-color, #f1f1f1);
}
</style>