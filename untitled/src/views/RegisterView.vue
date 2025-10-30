<template>
  <div class="register-container">
    <div class="register-box animate-fade-in">
      <div class="register-header">
        <h2 class="register-title">创建账户</h2>
        <p class="register-subtitle">加入我们的技术社区</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
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
          <label for="email" class="form-label">邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="请输入邮箱"
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
            placeholder="请设置密码"
            required
            :disabled="authStore.isLoading"
          />
          <p class="password-hint">密码至少包含8个字符，包括字母和数字</p>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword" class="form-label">确认密码</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-input"
            placeholder="请确认密码"
            required
            :disabled="authStore.isLoading"
          />
          <p v-if="form.password && form.confirmPassword && form.password !== form.confirmPassword" 
             class="error-hint animate-shake">
            两次输入的密码不一致
          </p>
        </div>
        
        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.acceptTerms" required />
            我已阅读并同意 <a href="/terms" class="terms-link">服务条款</a> 和 
            <a href="/privacy" class="privacy-link">隐私政策</a>
          </label>
        </div>
        
        <div v-if="authStore.error" class="error-message animate-shake">
          {{ authStore.error }}
        </div>
        
        <button
          type="submit"
          class="register-button btn btn-primary"
          :disabled="authStore.isLoading || (form.password !== form.confirmPassword)"
        >
          <span v-if="authStore.isLoading" class="loading-spin"></span>
          <span v-else>注册</span>
        </button>
      </form>
      
      <div class="register-footer">
        <p>已有账户？ <router-link to="/login" class="login-link">立即登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const handleRegister = async () => {
  // 验证密码一致性
  if (form.password !== form.confirmPassword) {
    return
  }
  
  try {
    await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    })
    
    // 注册成功后跳转到登录页面
    router.push({
      path: '/login',
      query: { registered: true }
    })
  } catch (error) {
    // 错误已经在store中处理
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  padding: var(--spacing-lg);
}

.register-box {
  background-color: var(--bg-color-white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-light);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 450px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.register-box:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.register-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.register-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.register-subtitle {
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.register-form {
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

.password-hint {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.error-hint {
  font-size: var(--text-xs);
  color: var(--error-text-color);
  margin-top: var(--spacing-xs);
}

.form-options {
  font-size: var(--text-sm);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
  line-height: 1.5;
}

.checkbox-label input {
  margin-top: 2px;
}

.terms-link,
.privacy-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover,
.privacy-link:hover {
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

.register-button {
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

.register-button:disabled {
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

.register-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.login-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: var(--primary-hover-color);
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-box {
    padding: var(--spacing-lg);
  }
  
  .register-title {
    font-size: var(--text-xl);
  }
  
  .checkbox-label {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] .register-box {
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