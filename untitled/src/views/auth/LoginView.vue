<template>
  <div class="login-page-container">
    <div class="login-card">
      <!-- 登录标题 -->
      <div class="login-header">
        <h1 class="login-title">登录账户</h1>
        <p class="login-subtitle">欢迎回来，请登录您的账户</p>
      </div>
      
      <!-- 登录表单 -->
      <el-form 
        v-loading="authStore.isLoading" 
        element-loading-text="正在登录..."
        :model="loginForm" 
        :rules="validationRules" 
        ref="loginFormRef"
        label-position="top"
        class="login-form"
        @keyup.enter.native="handleLoginSubmit"
      >
        <!-- 用户名输入 -->
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名或邮箱"
            prefix-icon="el-icon-user"
            size="large"
            autocomplete="username"
            clearable
          />
        </el-form-item>
        
        <!-- 密码输入 -->
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
            size="large"
            autocomplete="current-password"
          />
        </el-form-item>
        
        <!-- 记住我和忘记密码 -->
        <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.rememberMe" size="large">
              记住我
            </el-checkbox>
            <router-link to="/forgot-password" class="forgot-password-link">
              忘记密码？
            </router-link>
          </div>
        </el-form-item>
        
        <!-- 错误提示 -->
        <el-form-item v-if="loginError" class="error-message">
          <el-alert 
            :title="loginError" 
            type="error" 
            show-icon 
            :closable="false"
            class="login-error-alert"
          />
        </el-form-item>
        
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
            登录
          </el-button>
        </el-form-item>
        
        <!-- 注册链接 -->
        <div class="register-section">
          <span>还没有账号？</span>
          <router-link to="/register" class="register-link">
            立即注册
          </router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../store/modules/auth'

// 初始化路由和状态
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loginFormRef = ref(null)
const loginError = ref('')

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const validationRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
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
})

// 处理登录提交
const handleLoginSubmit = async () => {
  // 清除之前的错误信息
  loginError.value = ''
  authStore.clearError()
  
  // 验证表单
  try {
    await loginFormRef.value.validate()
  } catch (err) {
    console.log('表单验证失败:', err)
    // 表单验证失败时不抛出异常，使用Element Plus的默认错误提示
    return
  }
  
  try {
    // 表单验证
    await loginFormRef.value.validate()
    
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
      message: '登录成功！正在跳转到首页...',
      duration: 1500
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
      // 使用try-catch确保导航不会失败
      try {
        // 对于首页特殊处理，使用window.location.href实现完全刷新
        if (redirect === '/' || (import.meta.env.DEV && redirect === '/')) {
          window.location.href = '/'
        } else {
          router.push(redirect)
        }
      } catch (navError) {
        console.error('导航失败，使用备用重定向:', navError)
        // 降级到window.location.href
        window.location.href = redirect
      }
    }, 500)
    
  } catch (error) {
    // 处理验证失败或登录错误
    if (error === false) {
      // 表单验证失败，由Element Plus自动处理提示
      return
    }
    
    // 显示登录错误
    loginError.value = authStore.error || '登录失败，请检查用户名和密码是否正确'
    console.error('登录错误:', error)
    
    // 添加错误动画效果到整个表单
    setTimeout(() => {
      const formEl = document.querySelector('.login-form')
      if (formEl) {
        formEl.classList.add('error-shake')
        setTimeout(() => formEl.classList.remove('error-shake'), 600)
      }
    }, 100)
  }
}

// 登录成功处理
const handleLoginSuccess = () => {
  // 显示成功消息
  ElMessage.success({
    message: '登录成功！正在跳转到首页...',
    duration: 1500
  })
  
  // 获取重定向路径
  const redirect = route.query.redirect || '/'
  
  // 延迟跳转，让用户看到成功提示
  setTimeout(() => {
    // 根据环境选择合适的跳转方式
    if (import.meta.env.DEV && redirect === '/') {
      // 开发环境下刷新页面以确保所有状态正确加载
      window.location.href = '/'
    } else {
      // 其他情况使用路由跳转
      router.push(redirect)
    }
  }, 500)
}

// 监听键盘事件，支持回车登录
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !authStore.isLoading) {
    handleLoginSubmit()
  }
})
</script>

<style scoped>
/* 根变量定义 */
:root {
  --primary-color: #1890ff;
  --primary-hover: #40a9ff;
  --bg-primary: #f0f2f5;
  --bg-white: #ffffff;
  --text-primary: #303133;
  --text-secondary: #606266;
  --text-placeholder: #c0c4cc;
  --border-color: #dcdfe6;
  --border-hover: #c6e2ff;
  --shadow-light: 0 2px 12px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.12);
  --border-radius: 8px;
  --border-radius-lg: 16px;
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
}

/* 基础容器样式 */
.login-page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding: 20px;
  transition: background-color var(--transition-normal);
}

/* 登录卡片 */
.login-card {
  background-color: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

/* 卡片悬停效果 */
.login-card:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.2;
}

.login-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

/* 登录表单 */
.login-form {
  width: 100%;
}

/* Element Plus 组件样式覆盖 */
.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-form-item__label) {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
  padding: 0;
}

/* 输入框样式 */
.login-form :deep(.el-input) {
  width: 100%;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  border-color: var(--border-color);
  background-color: transparent;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--border-hover);
  border-color: var(--primary-color);
}

.login-form :deep(.el-input__inner) {
  height: 50px;
  font-size: 16px;
  color: var(--text-primary);
  background-color: transparent;
}

/* 表单选项区域 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.forgot-password-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  transition: color var(--transition-fast);
}

.forgot-password-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* 错误消息样式 */
.error-message {
  margin-bottom: 20px;
}

.login-error-alert {
  margin: 0;
  animation: fadeIn 0.3s ease;
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
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  border: none;
  transition: all var(--transition-normal);
  padding: 0;
}

.login-button:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 注册区域 */
.register-section {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-secondary);
}

.register-link {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  transition: color var(--transition-fast);
  margin-left: 4px;
}

.register-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 加载状态优化 */
.login-form :deep(.el-loading-spinner) {
  transform: scale(0.9);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-page-container {
    padding: 16px;
  }
  
  .login-card {
    padding: 32px 24px;
    border-radius: var(--border-radius);
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
  
  .login-form :deep(.el-input__inner) {
    height: 46px;
  }
  
  .login-button {
    height: 46px;
  }
}

@media (max-width: 480px) {
  .login-page-container {
    padding: 0;
  }
  
  .login-card {
    padding: 24px;
    box-shadow: none;
    border-radius: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .login-header {
    margin-bottom: 24px;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .forgot-password-link {
    align-self: flex-end;
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
  --border-hover: rgba(24, 144, 255, 0.3);
  --shadow-light: 0 2px 12px rgba(0, 0, 0, 0.3);
  --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .login-form :deep(.el-input__wrapper) {
  background-color: #2c2c2c;
}

[data-theme="dark"] .login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

[data-theme="dark"] .login-form :deep(.el-checkbox__label) {
  color: var(--text-primary);
}
</style>