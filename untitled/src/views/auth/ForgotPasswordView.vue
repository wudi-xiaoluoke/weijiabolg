<template>
  <div class="forgot-password-container">
    <div class="forgot-password-box animate-fade-in">
      <div class="forgot-password-header">
        <h2 class="forgot-password-title">找回密码</h2>
        <p class="forgot-password-subtitle">我们将发送重置密码的链接到您的邮箱</p>
      </div>
      
      <div v-if="!emailSent" class="form-wrapper">
        <form @submit.prevent="handleSendResetLink" class="forgot-password-form">
          <div class="form-group">
            <label for="email" class="form-label">邮箱</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="请输入您注册时的邮箱"
              required
              :disabled="isLoading"
            />
          </div>
          
          <div v-if="error" class="error-message animate-shake">
            {{ error }}
          </div>
          
          <div v-if="success" class="success-message">
            {{ success }}
          </div>
          
          <button
            type="submit"
            class="submit-button btn btn-primary"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spin"></span>
            <span v-else>发送重置链接</span>
          </button>
        </form>
      </div>
      
      <div v-else class="success-container">
        <div class="success-icon">✓</div>
        <h3 class="success-title">邮件已发送</h3>
        <p class="success-description">
          重置密码的链接已发送到您的邮箱，请查收并按照邮件说明操作。
        </p>
        <p class="check-spam">
          如果没有收到邮件，请检查您的垃圾邮件文件夹。
        </p>
        <router-link to="/login" class="back-login">
          返回登录
        </router-link>
      </div>
      
      <div class="forgot-password-footer">
        <p>记得密码了？ <router-link to="/login" class="login-link">立即登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as authAPI from '@/api/modules/auth'

const email = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const emailSent = ref(false)

const handleSendResetLink = async () => {
  error.value = ''
  success.value = ''
  
  try {
    isLoading.value = true
    
    // 调用API发送重置密码链接
    await authAPI.sendResetPasswordLink({ email: email.value })
    
    emailSent.value = true
    ElMessage.success('重置密码链接已发送')
  } catch (err) {
    error.value = err.response?.data?.message || '发送重置链接失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  padding: var(--spacing-lg);
}

.forgot-password-box {
  background-color: var(--bg-color-white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-light);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 400px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.forgot-password-box:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.forgot-password-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.forgot-password-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.forgot-password-subtitle {
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.form-wrapper,
.success-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.forgot-password-form {
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

.error-message {
  background-color: var(--error-bg-color);
  color: var(--error-text-color);
  padding: var(--spacing-base);
  border-radius: var(--border-radius-base);
  font-size: var(--text-sm);
  text-align: center;
}

.success-message {
  background-color: var(--success-bg-color);
  color: var(--success-text-color);
  padding: var(--spacing-base);
  border-radius: var(--border-radius-base);
  font-size: var(--text-sm);
  text-align: center;
}

.submit-button {
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

.submit-button:disabled {
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

/* 成功状态样式 */
.success-container {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.success-icon {
  width: 60px;
  height: 60px;
  background-color: var(--success-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto var(--spacing-lg);
}

.success-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-base);
}

.success-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-base);
  line-height: 1.6;
}

.check-spam {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-xl);
}

.back-login {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-base) var(--spacing-xl);
  border-radius: var(--border-radius-base);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.back-login:hover {
  background-color: var(--primary-hover-color);
}

.forgot-password-footer {
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
  .forgot-password-box {
    padding: var(--spacing-lg);
  }
  
  .forgot-password-title {
    font-size: var(--text-xl);
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] .forgot-password-box {
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