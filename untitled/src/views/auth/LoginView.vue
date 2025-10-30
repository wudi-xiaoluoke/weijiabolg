<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="form-title">用户登录</h2>
      
      <el-form 
        :model="loginForm" 
        :rules="rules" 
        ref="loginFormRef"
        label-position="top"
        class="form mobile-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            prefix-icon="el-icon-user"
            :disabled="isLoading"
            class="touch-friendly"
            size="large"
            autocomplete="username"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="el-icon-lock"
            :disabled="isLoading"
            show-password
            class="touch-friendly"
            size="large"
            autocomplete="current-password"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="form-actions">
            <el-button 
              type="primary" 
              @click="handleLogin" 
              :loading="isLoading"
              class="login-btn touch-friendly"
              size="large"
            >
              登录
            </el-button>
            <router-link to="/register" class="register-link touch-friendly">
              还没有账号？立即注册
            </router-link>
          </div>
        </el-form-item>
      </el-form>
      
      <!-- 错误提示 -->
      <el-alert 
        v-if="error" 
        :title="error" 
        type="error" 
        show-icon 
        class="error-alert"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../store/modules/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loginFormRef = ref(null)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 获取store中的状态
const { isLoading, error } = authStore

// 处理登录
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    
    await authStore.login(loginForm.username, loginForm.password)
    
    // 登录成功后跳转
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    // 表单验证失败或登录失败
    console.error('登录失败:', err)
  }
}
</script>

<style scoped>
/* 基础样式，使用CSS变量 */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--padding-lg, 20px);
  background-color: var(--bg-color-base, #f5f7fa);
  transition: background-color var(--transition-base, 0.3s);
}

.login-form {
  background-color: var(--bg-color-white, #ffffff);
  border-radius: var(--border-radius-large, 12px);
  box-shadow: var(--shadow-base, 0 2px 12px rgba(0, 0, 0, 0.1));
  padding: var(--padding-xl, 30px);
  width: 100%;
  max-width: 480px;
  transition: all var(--transition-base, 0.3s);
}

/* 暗黑主题适配 */
[data-theme="dark"] .login-form {
  background-color: var(--bg-color-dark-800, #1f1f1f);
  box-shadow: var(--shadow-dark, 0 2px 12px rgba(0, 0, 0, 0.3));
}

.form-title {
  text-align: center;
  margin-bottom: var(--margin-xl, 32px);
  color: var(--text-color-primary, #303133);
  font-size: var(--font-size-xl, 24px);
  font-weight: 600;
}

.form {
  width: 100%;
}

/* 移动端表单优化 */
.mobile-form :deep(.el-form-item) {
  margin-bottom: var(--margin-base, 20px);
}

.mobile-form :deep(.el-form-item__label) {
  font-size: var(--font-size-base, 16px);
  color: var(--text-color-primary, #303133);
  margin-bottom: var(--margin-sm, 8px);
  font-weight: 500;
}

.mobile-form :deep(.el-input__wrapper) {
  border-radius: var(--border-radius-base, 6px);
  transition: all var(--transition-base, 0.3s);
}

.mobile-form :deep(.el-input__inner) {
  height: 44px;
  font-size: var(--font-size-base, 16px);
  color: var(--text-color-primary, #303133);
  background-color: var(--bg-color-base, #f5f7fa);
}

/* 表单操作区域 */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--margin-base, 16px);
  margin-top: var(--margin-lg, 24px);
}

.login-btn {
  flex: 1;
  min-width: 120px;
  height: 44px;
  font-size: var(--font-size-base, 16px);
  font-weight: 500;
  border-radius: var(--border-radius-base, 6px);
  transition: all var(--transition-base, 0.3s);
}

.register-link {
  color: var(--primary-color, #1890ff);
  text-decoration: none;
  font-size: var(--font-size-sm, 14px);
  white-space: nowrap;
}

.register-link:hover {
  color: var(--primary-color-hover, #40a9ff);
  text-decoration: underline;
}

/* 错误提示 */
.error-alert {
  margin-top: var(--margin-lg, 20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: var(--padding-base, 16px);
  }
  
  .login-form {
    padding: var(--padding-lg, 24px);
    border-radius: var(--border-radius-base, 8px);
  }
  
  .form-title {
    font-size: var(--font-size-lg, 20px);
    margin-bottom: var(--margin-lg, 24px);
  }
  
  .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
  
  .register-link {
    text-align: center;
    padding: var(--padding-sm, 8px) 0;
  }
}

@media (max-width: 480px) {
  .login-form {
    padding: var(--padding-md, 20px);
    box-shadow: none;
    max-width: 100%;
    height: 100vh;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .login-container {
    padding: 0;
    background-color: transparent;
  }
}

/* 触摸优化 */
.touch-friendly {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加载状态优化 */
.login-btn :deep(.el-loading-spinner) {
  transform: scale(0.8);
}

/* 焦点状态优化 */
.mobile-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 错误状态样式 */
.mobile-form :deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
}

.mobile-form :deep(.el-form-item__error) {
  font-size: var(--font-size-xs, 12px);
  color: var(--text-color-danger, #f56c6c);
  margin-top: var(--margin-xs, 4px);
}
</style>