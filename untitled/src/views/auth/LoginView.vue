<template>
  <div class="login-page-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>
    
    <div class="login-card">
      <!-- 品牌Logo -->
      <div class="logo-container">
        <div class="logo-icon">
          <span class="logo-text">WJ</span>
        </div>
        <h1 class="app-title">技术博客</h1>
      </div>
      
      <!-- 登录标题 -->
      <div class="login-header">
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-subtitle">请登录您的账户继续访问</p>
      </div>
      
      <!-- 登录表单 -->
      <el-form 
        v-loading="authStore.isLoading" 
        element-loading-text="正在登录..."
        element-loading-spinner="ElLoading"
        :model="loginForm" 
        :rules="validationRules" 
        ref="loginFormRef"
        class="login-form"
        @keyup.enter="handleLoginSubmit"
      >
        <!-- 用户名输入 -->
        <el-form-item prop="username">
          <div class="input-container">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入用户名或邮箱"
              prefix-icon="el-icon-user"
              size="large"
              autocomplete="username"
              clearable
              :class="{ 'input-focus': isUsernameFocused }"
              @focus="isUsernameFocused = true"
              @blur="isUsernameFocused = false"
            />
            <div class="input-decoration"></div>
          </div>
        </el-form-item>
        
        <!-- 密码输入 -->
        <el-form-item prop="password">
          <div class="input-container">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              show-password
              size="large"
              autocomplete="current-password"
              :class="{ 'input-focus': isPasswordFocused }"
              @focus="isPasswordFocused = true"
              @blur="isPasswordFocused = false"
            />
            <div class="input-decoration"></div>
          </div>
        </el-form-item>
        
        <!-- 记住我和忘记密码 -->
        <div class="form-options">
          <el-checkbox v-model="loginForm.rememberMe" class="remember-me">
            记住我
          </el-checkbox>
          <router-link to="/forgot-password" class="forgot-password-link">
            忘记密码？
          </router-link>
        </div>
        
        <!-- 错误提示 -->
        <div v-if="loginError" class="error-message-wrapper">
          <div class="error-message" :class="{ 'error-shake': showErrorShake }">
            <el-icon class="error-icon"><Close /></el-icon>
            <span>{{ loginError }}</span>
          </div>
        </div>
        
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLoginSubmit"
            :loading="authStore.isLoading"
            size="large"
            class="login-button"
            :disabled="authStore.isLoading"
          >
            <template #default>
              <el-icon v-if="!authStore.isLoading"><Check /></el-icon>
              <span>登录账户</span>
            </template>
          </el-button>
        </el-form-item>
        
        <!-- 分隔线 -->
        <div class="divider">
          <span class="divider-text">还没有账号？</span>
        </div>
        
        <!-- 注册链接 -->
        <router-link to="/register" class="register-button">
          <span>立即注册</span>
        </router-link>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import { useAuthStore } from '../../store/modules/auth'

// 初始化路由和状态
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loginFormRef = ref(null)
const loginError = ref('')
const showErrorShake = ref(false)
const isUsernameFocused = ref(false)
const isPasswordFocused = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const validationRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 加载本地存储的用户名（如果有）
onMounted(() => {
  // 检查是否已经登录
  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect || '/'
    router.push(redirect)
    return
  }
  
  // 从本地存储加载保存的用户名
  const savedUsername = localStorage.getItem('saved_username')
  if (savedUsername) {
    loginForm.username = savedUsername
    loginForm.rememberMe = true
  }
  
  // 清除之前的错误信息
  authStore.clearError()
  loginError.value = ''
  
  // 添加全局键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 处理键盘事件
const handleKeydown = (e) => {
  // 只有在表单区域有焦点时才响应回车登录
  const activeElement = document.activeElement
  if (e.key === 'Enter' && !authStore.isLoading && 
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    handleLoginSubmit()
  }
}

// 处理登录提交
const handleLoginSubmit = async () => {
  // 清除之前的错误信息
  loginError.value = ''
  authStore.clearError()
  showErrorShake.value = false
  
  // 验证表单
  try {
    await loginFormRef.value.validate()
  } catch (err) {
    console.log('表单验证失败:', err)
    return
  }
  
  try {
    // 保存用户名（如果选择记住我）
    if (loginForm.rememberMe) {
      localStorage.setItem('saved_username', loginForm.username)
    } else {
      localStorage.removeItem('saved_username')
    }
    
    // 调用登录API
    await authStore.login(loginForm.username, loginForm.password)
    
    // 显示成功消息
    ElMessage.success({
      message: '登录成功！正在跳转...',
      duration: 1200
    })
    
    // 获取重定向路径
    let redirect = route.query.redirect || '/'
    
    // 验证重定向URL的安全性，防止XSS攻击
    if (!redirect.startsWith('/') || redirect.includes('://')) {
      console.warn('不安全的重定向URL，使用默认路径')
      redirect = '/'
    }
    
    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      try {
        // 对于首页特殊处理，使用window.location.href实现完全刷新
        if (redirect === '/' || (import.meta.env.DEV && redirect === '/')) {
          window.location.href = '/'
        } else {
          router.push(redirect)
        }
      } catch (navError) {
        console.error('导航失败，使用备用重定向:', navError)
        window.location.href = redirect
      }
    }, 800)
    
  } catch (error) {
    // 处理登录错误
    loginError.value = authStore.error || '登录失败，请检查用户名和密码是否正确'
    console.error('登录错误:', error)
    
    // 添加错误动画效果
    showErrorShake.value = true
    setTimeout(() => {
      showErrorShake.value = false
    }, 600)
    
    // 聚焦到第一个输入框
    const usernameInput = document.querySelector('input[autocomplete="username"]')
    if (usernameInput) {
      usernameInput.focus()
    }
  }
}
</script>

<style scoped>
/* 根变量定义 */
:root {
  --primary-color: #409eff;
  --primary-light: #ecf5ff;
  --primary-hover: #66b1ff;
  --primary-active: #3a8ee6;
  --danger-color: #f56c6c;
  --bg-primary: #f5f7fa;
  --bg-white: #ffffff;
  --text-primary: #303133;
  --text-secondary: #606266;
  --text-placeholder: #c0c4cc;
  --border-color: #dcdfe6;
  --border-focus: #b3d8ff;
  --shadow-base: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 4px 20px 0 rgba(0, 0, 0, 0.12);
  --shadow-elevated: 0 12px 40px rgba(0, 0, 0, 0.16);
  --border-radius: 12px;
  --border-radius-sm: 8px;
  --border-radius-lg: 20px;
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 基础容器样式 */
.login-page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 20px;
  font-family: var(--font-family);
  position: relative;
  overflow: hidden;
  transition: background-color var(--transition-normal);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(64, 158, 255, 0.05) 0%, transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(64, 158, 255, 0.03) 0%, transparent 25%),
    radial-gradient(circle at 50% 50%, rgba(64, 158, 255, 0.02) 0%, transparent 50%);
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0) 70%);
  filter: blur(40px);
  animation: float 20s ease-in-out infinite;
}

.bg-circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
  animation-delay: -5s;
}

.bg-circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 20%;
  transform: translateY(-50%);
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(20px, 20px);
  }
  50% {
    transform: translate(0, 40px);
  }
  75% {
    transform: translate(-20px, 20px);
  }
}

/* 登录卡片 */
.login-card {
  background-color: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-base);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  z-index: 1;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 卡片悬停效果 */
.login-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
  border-color: var(--primary-color);
}

/* 品牌Logo */
.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  text-align: center;
}

.logo-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
  transition: all var(--transition-normal);
}

.logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(64, 158, 255, 0.4);
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-title {
  font-size: 26px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.2;
}

.login-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* 登录表单 */
.login-form {
  width: 100%;
}

/* Element Plus 组件样式覆盖 */
.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

/* 输入框容器 */
.input-container {
  position: relative;
  width: 100%;
}

.login-form :deep(.el-input) {
  width: 100%;
  position: relative;
  z-index: 2;
  transition: all var(--transition-fast);
}

.login-form :deep(.el-input__wrapper) {
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  border-color: var(--border-color);
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  height: 52px;
  padding: 0 16px;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px var(--primary-light);
  border-color: var(--primary-color);
}

.login-form :deep(.el-input__inner) {
  height: 52px;
  font-size: 16px;
  color: var(--text-primary);
  background-color: transparent;
  padding-left: 8px;
}

.login-form :deep(.el-input__prefix-inner) {
  margin-right: 8px;
  color: var(--text-placeholder);
}

.login-form :deep(.el-input__suffix-inner) {
  color: var(--text-secondary);
}

/* 输入框装饰 */
.input-decoration {
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-fast);
  z-index: 1;
}

.login-form :deep(.el-input__wrapper:hover) + .input-decoration,
.input-focus + .input-decoration {
  transform: scaleX(1);
}

/* 表单选项区域 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.remember-me {
  font-size: 14px;
  color: var(--text-secondary);
}

.login-form :deep(.el-checkbox__label) {
  font-size: 14px;
  color: var(--text-secondary);
}

.login-form :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.login-form :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: var(--primary-color);
}

.forgot-password-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
  position: relative;
  padding: 4px 0;
}

.forgot-password-link:hover {
  color: var(--primary-hover);
}

.forgot-password-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--primary-color);
  transition: width var(--transition-fast);
}

.forgot-password-link:hover::after {
  width: 100%;
}

/* 错误消息样式 */
.error-message-wrapper {
  margin-bottom: 24px;
}

.error-message {
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: var(--border-radius-sm);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-fast);
  animation: fadeIn 0.3s ease;
}

.error-icon {
  color: var(--danger-color);
  font-size: 16px;
}

.error-message span {
  color: var(--danger-color);
  font-size: 14px;
  font-weight: 500;
}

/* 错误震动动画 */
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-shake {
  animation: error-shake 0.6s ease-in-out;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--border-radius);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-active) 100%);
  border: none;
  transition: all var(--transition-normal);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  color: white;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-color) 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* 分隔线 */
.divider {
  text-align: center;
  margin: 32px 0 24px;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--border-color);
  transform: translateY(-50%);
}

.divider-text {
  position: relative;
  padding: 0 16px;
  background-color: var(--bg-white);
  color: var(--text-secondary);
  font-size: 14px;
}

/* 注册按钮 */
.register-button {
  display: block;
  width: 100%;
  height: 52px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  line-height: 52px;
  transition: all var(--transition-normal);
}

.register-button:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* 加载状态优化 */
.login-form :deep(.el-loading-spinner) {
  transform: scale(0.9);
}

.login-form :deep(.el-loading-spinner .path) {
  stroke: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-page-container {
    padding: 16px;
  }
  
  .login-card {
    padding: 36px 24px;
    border-radius: var(--border-radius);
  }
  
  .logo-icon {
    width: 60px;
    height: 60px;
  }
  
  .logo-text {
    font-size: 24px;
  }
  
  .app-title {
    font-size: 22px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .login-subtitle {
    font-size: 14px;
  }
  
  .login-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  
  .login-form :deep(.el-input__wrapper),
  .login-form :deep(.el-input__inner) {
    height: 48px;
  }
  
  .login-button,
  .register-button {
    height: 48px;
    line-height: 48px;
  }
  
  .form-options {
    margin-bottom: 24px;
  }
}

@media (max-width: 480px) {
  .login-page-container {
    padding: 0;
  }
  
  .login-card {
    padding: 32px 20px;
    box-shadow: none;
    border-radius: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .bg-circle {
    filter: blur(30px);
  }
  
  .bg-circle-1 {
    width: 300px;
    height: 300px;
  }
  
  .bg-circle-2 {
    width: 250px;
    height: 250px;
  }
  
  .bg-circle-3 {
    width: 150px;
    height: 150px;
  }
  
  .logo-container {
    margin-bottom: 28px;
  }
  
  .login-header {
    margin-bottom: 32px;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .forgot-password-link {
    align-self: flex-end;
  }
  
  .divider {
    margin: 28px 0 20px;
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-white: #252525;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --text-placeholder: #808080;
  --border-color: #404040;
  --border-focus: rgba(64, 158, 255, 0.3);
  --shadow-base: 0 2px 12px rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 4px 20px rgba(0, 0, 0, 0.4);
  --primary-light: rgba(64, 158, 255, 0.1);
}

[data-theme="dark"] .login-page-container {
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(64, 158, 255, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(64, 158, 255, 0.05) 0%, transparent 25%);
}

[data-theme="dark"] .login-form :deep(.el-input__wrapper) {
  background-color: #2c2c2c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px var(--primary-light);
}

[data-theme="dark"] .login-form :deep(.el-input__inner) {
  color: var(--text-primary);
}

[data-theme="dark"] .login-form :deep(.el-checkbox__label) {
  color: var(--text-secondary);
}

[data-theme="dark"] .login-card {
  border-color: #404040;
  box-shadow: var(--shadow-base);
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .error-message {
  background-color: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.3);
}

[data-theme="dark"] .register-button {
  background-color: #2c2c2c;
  border-color: #404040;
}

[data-theme="dark"] .register-button:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-color);
}

[data-theme="dark"] .divider::before {
  background-color: #404040;
}

[data-theme="dark"] .divider-text {
  background-color: var(--bg-white);
}

[data-theme="dark"] .bg-circle {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(64, 158, 255, 0) 70%);
}
</style>