<template>
  <div class="reset-password-container">
    <div class="reset-password-box animate-fade-in">
      <div class="reset-password-header">
        <h2 class="reset-password-title">重置密码</h2>
        <p class="reset-password-subtitle">请设置您的新密码</p>
      </div>
      
      <div v-if="!resetSuccess" class="form-wrapper">
        <form @submit.prevent="handleResetPassword" class="reset-password-form">
          <div class="form-group">
            <label for="password" class="form-label">新密码</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="请输入新密码"
              required
              :disabled="isLoading"
              minlength="6"
            />
            <div class="password-strength" v-if="password">
              <div class="strength-indicator">
                <div 
                  class="strength-bar" 
                  :class="getPasswordStrengthClass()"
                  :style="{ width: getPasswordStrengthWidth() }"
                ></div>
              </div>
              <span class="strength-text">{{ getPasswordStrengthText() }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword" class="form-label">确认新密码</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="请再次输入新密码"
              required
              :disabled="isLoading"
            />
            <div v-if="password !== '' && confirmPassword !== '' && password !== confirmPassword" class="error-text">
              两次输入的密码不一致
            </div>
          </div>
          
          <div v-if="error" class="error-message animate-shake">
            {{ error }}
          </div>
          
          <button
            type="submit"
            class="submit-button btn btn-primary"
            :disabled="isLoading || !isFormValid()"
          >
            <span v-if="isLoading" class="loading-spin"></span>
            <span v-else>重置密码</span>
          </button>
        </form>
      </div>
      
      <div v-else class="success-container">
        <div class="success-icon">✓</div>
        <h3 class="success-title">密码重置成功</h3>
        <p class="success-description">
          您的密码已成功重置，请使用新密码登录您的账户。
        </p>
        <router-link to="/login" class="go-login">
          前往登录
        </router-link>
      </div>
      
      <div class="reset-password-footer">
        <p>遇到问题？ <a href="#" class="support-link">联系我们</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as authAPI from '@/api/modules/auth'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const resetSuccess = ref(false)
const token = computed(() => route.query.token)

// 检查URL中是否有token参数
onMounted(() => {
  if (!token.value) {
    error.value = '无效的重置链接，请重新申请重置密码'
  }
})

// 验证表单是否有效
const isFormValid = () => {
  return (
    password.value.length >= 6 && 
    confirmPassword.value.length >= 6 &&
    password.value === confirmPassword.value &&
    token.value
  )
}

// 密码强度检查
const getPasswordStrength = () => {
  const pass = password.value
  let strength = 0
  
  // 长度检查
  if (pass.length >= 8) strength++
  
  // 包含数字
  if (/\d/.test(pass)) strength++
  
  // 包含小写字母
  if (/[a-z]/.test(pass)) strength++
  
  // 包含大写字母
  if (/[A-Z]/.test(pass)) strength++
  
  // 包含特殊字符
  if (/[^A-Za-z0-9]/.test(pass)) strength++
  
  return strength
}

const getPasswordStrengthClass = () => {
  const strength = getPasswordStrength()
  
  if (strength <= 2) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
}

const getPasswordStrengthWidth = () => {
  const strength = getPasswordStrength()
  return `${(strength / 5) * 100}%`
}

const getPasswordStrengthText = () => {
  const strength = getPasswordStrength()
  
  if (strength <= 2) return '弱'
  if (strength <= 3) return '中'
  return '强'
}

const handleResetPassword = async () => {
  if (!isFormValid()) return
  
  error.value = ''
  
  try {
    isLoading.value = true
    
    await authAPI.resetPassword({
      token: token.value,
      newPassword: password.value
    })
    
    resetSuccess.value = true
    ElMessage.success('密码重置成功')
  } catch (err) {
    error.value = err.response?.data?.message || '重置密码失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color-secondary);
  padding: var(--spacing-lg);
}

.reset-password-box {
  background-color: var(--bg-color-white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-light);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 400px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.reset-password-box:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.reset-password-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.reset-password-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.reset-password-subtitle {
  color: var(--text-secondary);
  font-size: var(--text-base);
}

.form-wrapper,
.success-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.reset-password-form {
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

.password-strength {
  margin-top: var(--spacing-xs);
}

.strength-indicator {
  width: 100%;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.strength-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 2px;
}

.strength-bar.weak {
  background-color: var(--error-color);
}

.strength-bar.medium {
  background-color: var(--warning-color);
}

.strength-bar.strong {
  background-color: var(--success-color);
}

.strength-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.error-text {
  color: var(--error-color);
  font-size: var(--text-xs);
}

.error-message {
  background-color: var(--error-bg-color);
  color: var(--error-text-color);
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
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.go-login {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-base) var(--spacing-xl);
  border-radius: var(--border-radius-base);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.go-login:hover {
  background-color: var(--primary-hover-color);
}

.reset-password-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.support-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.support-link:hover {
  color: var(--primary-hover-color);
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reset-password-box {
    padding: var(--spacing-lg);
  }
  
  .reset-password-title {
    font-size: var(--text-xl);
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] .reset-password-box {
  background-color: var(--bg-color-dark);
}

[data-theme="dark"] .form-input {
  background-color: var(--bg-color-darker);
  border-color: var(--border-dark-color);
}

[data-theme="dark"] .form-input:focus {
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>