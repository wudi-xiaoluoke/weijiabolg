<template>
  <div class="register-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>
    
    <div class="register-card">
      <!-- 品牌Logo -->
      <div class="logo-container">
        <div class="logo-icon">
          <span class="logo-text">WJ</span>
        </div>
        <h1 class="app-title">技术博客</h1>
      </div>
      
      <!-- 注册标题 -->
      <div class="register-header">
        <h2 class="register-title">创建账户</h2>
        <p class="register-subtitle">加入我们的技术社区，分享你的知识和见解</p>
      </div>
      
      <el-form 
        :model="registerForm" 
        :rules="rules" 
        ref="registerFormRef"
        class="register-form"
        @keyup.enter="handleRegister"
      >
        <!-- 用户名输入 -->
        <el-form-item prop="username">
          <div class="input-container">
            <el-input 
              v-model="registerForm.username" 
              placeholder="请设置用户名" 
              prefix-icon="el-icon-user"
              :disabled="authStore.isLoading"
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
        
        <!-- 邮箱输入 -->
        <el-form-item prop="email">
          <div class="input-container">
            <el-input 
              v-model="registerForm.email" 
              placeholder="请输入邮箱地址" 
              prefix-icon="el-icon-message"
              :disabled="authStore.isLoading"
              size="large"
              autocomplete="email"
              clearable
              :class="{ 'input-focus': isEmailFocused }"
              @focus="isEmailFocused = true"
              @blur="isEmailFocused = false"
            />
            <div class="input-decoration"></div>
          </div>
        </el-form-item>
        
        <!-- 密码输入 -->
        <el-form-item prop="password">
          <div class="input-container">
            <el-input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="请设置6-20位密码" 
              prefix-icon="el-icon-lock"
              :disabled="authStore.isLoading"
              show-password
              size="large"
              autocomplete="new-password"
              :class="{ 'input-focus': isPasswordFocused }"
              @focus="isPasswordFocused = true"
              @blur="isPasswordFocused = false"
            />
            <div class="input-decoration"></div>
          </div>
          <!-- 密码强度提示 -->
          <div v-if="passwordStrength > 0" class="password-strength-container">
            <div class="strength-bars">
              <div 
                v-for="i in 3" 
                :key="i" 
                class="strength-bar"
                :class="{ 
                  'strength-weak': i <= 1 && passwordStrength === 1,
                  'strength-medium': i <= 2 && passwordStrength === 2,
                  'strength-strong': i <= 3 && passwordStrength === 3
                }"
              ></div>
            </div>
            <span class="strength-text">{{ getStrengthText(passwordStrength) }}</span>
          </div>
        </el-form-item>
        
        <!-- 确认密码输入 -->
        <el-form-item prop="confirmPassword">
          <div class="input-container">
            <el-input 
              v-model="registerForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码" 
              prefix-icon="el-icon-lock"
              :disabled="authStore.isLoading"
              show-password
              size="large"
              autocomplete="new-password"
              :class="{ 'input-focus': isConfirmPasswordFocused }"
              @focus="isConfirmPasswordFocused = true"
              @blur="isConfirmPasswordFocused = false"
            />
            <div class="input-decoration"></div>
          </div>
        </el-form-item>
        
        <!-- 错误提示 -->
        <div v-if="authStore.error" class="error-message-wrapper">
          <div class="error-message" :class="{ 'error-shake': showErrorShake }">
            <el-icon class="error-icon"><Close /></el-icon>
            <span>{{ authStore.error }}</span>
          </div>
        </div>
        
        <!-- 注册按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleRegister" 
            :loading="authStore.isLoading"
            class="register-button"
            size="large"
          >
            <template #default>
              <el-icon v-if="!authStore.isLoading"><Plus /></el-icon>
              <span>创建账户</span>
            </template>
          </el-button>
        </el-form-item>
        
        <!-- 分隔线 -->
        <div class="divider">
          <span class="divider-text">已有账号？</span>
        </div>
        
        <!-- 登录链接 -->
        <router-link to="/login" class="login-button">
          <span>立即登录</span>
        </router-link>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import { useAuthStore } from '../../store/modules/auth'

const router = useRouter()
const authStore = useAuthStore()
const registerFormRef = ref(null)
const showErrorShake = ref(false)

// 输入框焦点状态
const isUsernameFocused = ref(false)
const isEmailFocused = ref(false)
const isPasswordFocused = ref(false)
const isConfirmPasswordFocused = ref(false)

// 注册表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 计算密码强度
const passwordStrength = computed(() => {
  if (!registerForm.password) return 0
  
  let strength = 0
  // 长度检查
  if (registerForm.password.length >= 8) strength++
  // 包含字母和数字
  if (/[a-zA-Z]/.test(registerForm.password) && /[0-9]/.test(registerForm.password)) strength++
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(registerForm.password)) strength++
  
  return strength
})

// 获取密码强度文本
const getStrengthText = (strength) => {
  switch (strength) {
    case 1: return '弱密码'
    case 2: return '中强度'
    case 3: return '强密码'
    default: return ''
  }
}

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 监听错误状态变化
watch(() => authStore.error, (newError) => {
  if (newError) {
    showErrorShake.value = true
    setTimeout(() => {
      showErrorShake.value = false
    }, 600)
  }
})

onMounted(() => {
  // 清理之前的错误信息
  authStore.clearError()
  // 添加全局键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 处理键盘事件
const handleKeydown = (e) => {
  // 只有在表单区域有焦点时才响应回车注册
  const activeElement = document.activeElement
  if (e.key === 'Enter' && !authStore.isLoading && 
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    handleRegister()
  }
}

// 处理注册
const handleRegister = async () => {
  try {
    // 清除之前的错误信息
    authStore.clearError()
    showErrorShake.value = false
    
    // 验证表单
    await registerFormRef.value.validate()
    
    // 提交注册数据
    await authStore.register(registerForm)
    
    // 显示成功消息
    ElMessage.success({
      message: '注册成功！正在跳转到登录页面...',
      duration: 1500
    })
    
    // 延迟跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 1000)
    
  } catch (err) {
    // 处理注册失败
    console.error('注册失败:', err)
    
    // 如果没有错误信息，设置默认错误
    if (!authStore.error) {
      authStore.setError('注册失败，请稍后再试')
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
  --success-color: #67c23a;
  --warning-color: #e6a23c;
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
.register-container {
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

/* 注册卡片 */
.register-card {
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
.register-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
  border-color: var(--primary-color);
}

/* 品牌Logo */
.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
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

/* 注册头部 */
.register-header {
  text-align: center;
  margin-bottom: 36px;
}

.register-title {
  font-size: 26px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.2;
}

.register-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* 注册表单 */
.register-form {
  width: 100%;
}

/* Element Plus 组件样式覆盖 */
.register-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

/* 输入框容器 */
.input-container {
  position: relative;
  width: 100%;
}

.register-form :deep(.el-input) {
  width: 100%;
  position: relative;
  z-index: 2;
  transition: all var(--transition-fast);
}

.register-form :deep(.el-input__wrapper) {
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  border-color: var(--border-color);
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  height: 52px;
  padding: 0 16px;
}

.register-form :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.register-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px var(--primary-light);
  border-color: var(--primary-color);
}

.register-form :deep(.el-input__inner) {
  height: 52px;
  font-size: 16px;
  color: var(--text-primary);
  background-color: transparent;
  padding-left: 8px;
}

.register-form :deep(.el-input__prefix-inner) {
  margin-right: 8px;
  color: var(--text-placeholder);
}

.register-form :deep(.el-input__suffix-inner) {
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

.register-form :deep(.el-input__wrapper:hover) + .input-decoration,
.input-focus + .input-decoration {
  transform: scaleX(1);
}

/* 密码强度指示器 */
.password-strength-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.strength-bars {
  display: flex;
  gap: 6px;
  height: 4px;
}

.strength-bar {
  flex: 1;
  background-color: var(--border-color);
  border-radius: 2px;
  transition: all var(--transition-fast);
}

.strength-weak {
  background-color: var(--danger-color);
  box-shadow: 0 0 8px rgba(245, 108, 108, 0.3);
}

.strength-medium {
  background-color: var(--warning-color);
  box-shadow: 0 0 8px rgba(230, 162, 60, 0.3);
}

.strength-strong {
  background-color: var(--success-color);
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.3);
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
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

/* 注册按钮 */
.register-button {
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

.register-button:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-color) 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.register-button:disabled {
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

/* 登录按钮 */
.login-button {
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

.login-button:hover {
  background-color: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* 加载状态优化 */
.register-form :deep(.el-loading-spinner) {
  transform: scale(0.9);
}

.register-form :deep(.el-loading-spinner .path) {
  stroke: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 16px;
  }
  
  .register-card {
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
  
  .register-title {
    font-size: 24px;
  }
  
  .register-subtitle {
    font-size: 14px;
  }
  
  .register-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }
  
  .register-form :deep(.el-input__wrapper),
  .register-form :deep(.el-input__inner) {
    height: 48px;
  }
  
  .register-button,
  .login-button {
    height: 48px;
    line-height: 48px;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 0;
  }
  
  .register-card {
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
    margin-bottom: 24px;
  }
  
  .register-header {
    margin-bottom: 32px;
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

[data-theme="dark"] .register-container {
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(64, 158, 255, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(64, 158, 255, 0.05) 0%, transparent 25%);
}

[data-theme="dark"] .register-form :deep(.el-input__wrapper) {
  background-color: #2c2c2c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .register-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px var(--primary-light);
}

[data-theme="dark"] .register-form :deep(.el-input__inner) {
  color: var(--text-primary);
}

[data-theme="dark"] .strength-bar {
  background-color: #404040;
}

[data-theme="dark"] .error-message {
  background-color: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.3);
}

[data-theme="dark"] .login-button {
  background-color: #2c2c2c;
  border-color: #404040;
}

[data-theme="dark"] .login-button:hover {
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