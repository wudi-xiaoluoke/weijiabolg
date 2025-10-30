<template>
  <div class="login-container">
    <div class="login-box animate-fade-in">
      <div class="login-header">
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-subtitle">请登录您的账户</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            required
            :disabled="authStore.isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            required
            :disabled="authStore.isLoading"
          />
        </div>
        
        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.rememberMe" />
            记住我
          </label>
          <a href="/forgot-password" class="forgot-password">忘记密码？</a>
        </div>
        
        <div v-if="authStore.error" class="error-message animate-shake">
          {{ authStore.error }}
        </div>
        
        <button
          type="submit"
          class="login-button btn btn-primary"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading" class="loading-spin"></span>
          <span v-else>登录</span>
        </button>
      </form>
      
      <div class="login-footer">
        <p>还没有账户？ <router-link to="/register" class="register-link">立即注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const handleLogin = async () => {
  try {
    await authStore.login(form.username, form.password)
    
    // 获取重定向路径
    const redirect = route.query.redirect || '/'
    
    // 跳转到指定页面或首页
    router.push(redirect)
  } catch (error) {
    // 错误已经在store中处理
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  padding: var(--spacing-lg);
}

.login-box {
  background-color: var(--bg-color-white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-light);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 400px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-box:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.form-input {
  padding: var(--spacing-base);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-base);
  font-size: var(--text-base);
  background-color: var(--bg-color-white);
  color: var(--text-primary);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.form-input:disabled {
  background-color: var(--bg-color-disabled);
  cursor: not-allowed;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--primary-hover-color);
  text-decoration: underline;
}

.error-message {
  background-color: var(--error-bg-color);
  color: var(--error-text-color);
  padding: var(--spacing-base);
  border-radius: var(--border-radius-base);
  font-size: var(--text-sm);
  text-align: center;
}

.login-button {
  padding: var(--spacing-base);
  border: none;
  border-radius: var(--border-radius-base);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spin {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.login-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.register-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: var(--primary-hover-color);
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-box {
    padding: var(--spacing-lg);
  }
  
  .login-title {
    font-size: var(--text-xl);
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] .login-box {
  background-color: var(--bg-color-dark);
}

[data-theme="dark"] .form-input {
  background-color: var(--bg-color-darker);
  border-color: var(--border-dark-color);
}

[data-theme="dark"] .form-input:focus {
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
}
</style>