<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1 class="page-title">个人资料</h1>
    </div>
    
    <div class="profile-content">
      <div class="profile-sidebar">
        <div class="user-card">
          <div class="avatar-container">
            <img 
              :src="user?.avatar || '/default-avatar.png'" 
              :alt="user?.username"
              class="user-avatar"
            />
            <div class="avatar-upload-overlay">
              <label class="upload-button">
                <input 
                  type="file" 
                  @change="handleAvatarUpload"
                  accept="image/*"
                  class="avatar-input"
                />
                <span>+</span>
              </label>
            </div>
          </div>
          
          <h3 class="username">{{ user?.username || '用户' }}</h3>
          <p class="user-role">{{ getRoleText(user?.role) }}</p>
          <p class="user-email">{{ user?.email || '未设置邮箱' }}</p>
          
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ user?.articleCount || 0 }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ user?.commentCount || 0 }}</span>
              <span class="stat-label">评论</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ user?.followerCount || 0 }}</span>
              <span class="stat-label">粉丝</span>
            </div>
          </div>
        </div>
        
        <div class="menu-section">
          <h4 class="menu-title">设置</h4>
          <nav class="profile-menu">
            <button 
              @click="activeTab = 'basic'"
              :class="['menu-item', { active: activeTab === 'basic' }]"
            >
              基本信息
            </button>
            <button 
              @click="activeTab = 'password'"
              :class="['menu-item', { active: activeTab === 'password' }]"
            >
              修改密码
            </button>
            <button 
              @click="activeTab = 'security'"
              :class="['menu-item', { active: activeTab === 'security' }]"
            >
              安全设置
            </button>
            <button 
              @click="activeTab = 'articles'; loadUserArticles()"
              :class="['menu-item', { active: activeTab === 'articles' }]"
            >
              我的文章
            </button>
          </nav>
        </div>
      </div>
      
      <div class="profile-main">
        <!-- 基本信息表单 -->
        <div v-if="activeTab === 'basic'" class="form-card animate-fade-in">
          <h3 class="card-title">基本信息</h3>
          <form @submit.prevent="handleUpdateProfile" class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label for="username" class="form-label">用户名</label>
                <input
                  id="username"
                  v-model="profileForm.username"
                  type="text"
                  class="form-input"
                  placeholder="请输入用户名"
                  :disabled="authStore.isLoading"
                />
              </div>
              
              <div class="form-group">
                <label for="email" class="form-label">邮箱</label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入邮箱"
                  :disabled="authStore.isLoading"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="bio" class="form-label">个人简介</label>
              <textarea
                id="bio"
                v-model="profileForm.bio"
                class="form-input form-textarea"
                placeholder="介绍一下自己..."
                rows="4"
                :disabled="authStore.isLoading"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="location" class="form-label">所在地</label>
                <input
                  id="location"
                  v-model="profileForm.location"
                  type="text"
                  class="form-input"
                  placeholder="请输入所在地"
                  :disabled="authStore.isLoading"
                />
              </div>
              
              <div class="form-group">
                <label for="website" class="form-label">个人网站</label>
                <input
                  id="website"
                  v-model="profileForm.website"
                  type="url"
                  class="form-input"
                  placeholder="请输入个人网站"
                  :disabled="authStore.isLoading"
                />
              </div>
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                @click="resetForm"
                class="btn btn-secondary"
                :disabled="authStore.isLoading"
              >
                重置
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="authStore.isLoading"
              >
                <span v-if="authStore.isLoading" class="loading-spin"></span>
                <span v-else>保存更改</span>
              </button>
            </div>
          </form>
        </div>
        
        <!-- 修改密码表单 -->
        <div v-if="activeTab === 'password'" class="form-card animate-fade-in">
          <h3 class="card-title">修改密码</h3>
          <form @submit.prevent="handleUpdatePassword" class="profile-form">
            <div class="form-group">
              <label for="currentPassword" class="form-label">当前密码</label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                class="form-input"
                placeholder="请输入当前密码"
                required
                :disabled="authStore.isLoading"
              />
            </div>
            
            <div class="form-group">
              <label for="newPassword" class="form-label">新密码</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                class="form-input"
                placeholder="请输入新密码"
                required
                :disabled="authStore.isLoading"
              />
              <p class="password-hint">密码至少包含8个字符，包括字母和数字</p>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword" class="form-label">确认新密码</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                class="form-input"
                placeholder="请确认新密码"
                required
                :disabled="authStore.isLoading"
              />
              <p v-if="passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" 
                 class="error-hint animate-shake">
                两次输入的密码不一致
              </p>
            </div>
            
            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="authStore.isLoading || (passwordForm.newPassword !== passwordForm.confirmPassword)"
              >
                <span v-if="authStore.isLoading" class="loading-spin"></span>
                <span v-else>更新密码</span>
              </button>
            </div>
          </form>
        </div>
        
        <!-- 安全设置 -->
        <div v-if="activeTab === 'security'" class="form-card animate-fade-in">
          <h3 class="card-title">安全设置</h3>
          <div class="security-section">
            <div class="security-item">
              <div class="security-info">
                <h4>两步验证</h4>
                <p>启用后，登录时需要额外验证</p>
              </div>
              <div class="security-action">
                <label class="switch">
                  <input type="checkbox" v-model="securityForm.twoFactorEnabled" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h4>登录历史</h4>
                <p>查看近期登录活动</p>
              </div>
              <div class="security-action">
                <button class="btn btn-link">查看</button>
              </div>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h4>第三方登录</h4>
                <p>管理绑定的第三方账号</p>
              </div>
              <div class="security-action">
                <button class="btn btn-link">管理</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const activeTab = ref('basic')

// 计算属性
const user = computed(() => authStore.user)

// 表单数据
const profileForm = reactive({
  username: '',
  email: '',
  bio: '',
  location: '',
  website: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const securityForm = reactive({
  twoFactorEnabled: false
})

// 初始化表单数据
const initForm = () => {
  if (user.value) {
    profileForm.username = user.value.username || ''
    profileForm.email = user.value.email || ''
    profileForm.bio = user.value.bio || ''
    profileForm.location = user.value.location || ''
    profileForm.website = user.value.website || ''
  }
}

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    0: '普通用户',
    1: '管理员',
    2: '作者'
  }
  return roleMap[role] || '访客'
}

// 更新个人资料
const handleUpdateProfile = async () => {
  try {
    await authStore.updateUserProfile(profileForm)
    ElMessage.success('个人资料更新成功')
  } catch (error) {
    ElMessage.error('更新失败，请重试')
  }
}

// 更新密码
const handleUpdatePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  
  try {
    await authStore.updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    ElMessage.success('密码更新成功')
    // 清空表单
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    ElMessage.error('密码更新失败，请重试')
  }
}

// 重置表单
const resetForm = () => {
  initForm()
}

// 头像上传处理
const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 这里应该实现头像上传逻辑
    ElMessage.success('头像上传功能待实现')
  }
}

// 组件挂载时初始化
onMounted(() => {
  initForm()
})
        <!-- 我的文章标签页 -->
        <div v-if="activeTab === 'articles'" class="form-card animate-fade-in">
          <div class="card-header">
            <h3 class="card-title">我的文章</h3>
            <router-link to="/articles/edit" class="btn btn-primary btn-sm">
              写文章
            </router-link>
          </div>
          
          <div class="article-list-section">
            <div v-if="articleStore.loadingUserArticles" class="loading-container">
              <div class="loading-spinner"></div>
              <p>加载中...</p>
            </div>
            
            <div v-else-if="userArticles.length === 0" class="empty-state">
              <p>您还没有发表任何文章</p>
              <router-link to="/articles/edit" class="btn btn-primary">
                立即创作
              </router-link>
            </div>
            
            <div v-else class="user-articles-table">
              <table class="article-table">
                <thead>
                  <tr>
                    <th>标题</th>
                    <th>分类</th>
                    <th>发布日期</th>
                    <th>阅读量</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="article in userArticles" :key="article.id">
                    <td>
                      <router-link :to="`/article/${article.id}`" class="article-title-link">
                        {{ article.title }}
                      </router-link>
                    </td>
                    <td>{{ article.category || '未分类' }}</td>
                    <td>{{ formatDate(article.createdAt) }}</td>
                    <td>{{ article.viewCount || 0 }}</td>
                    <td>
                      <span class="article-status" :class="article.status">
                        {{ article.status === 1 ? '已发布' : '草稿' }}
                      </span>
                    </td>
                    <td class="article-actions">
                      <router-link :to="`/articles/edit?id=${article.id}`" class="btn btn-secondary btn-sm">
                        编辑
                      </router-link>
                      <button 
                        @click="handleDeleteArticle(article.id)"
                        class="btn btn-danger btn-sm"
                        :disabled="articleStore.deleting"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/modules/auth'
import { useArticleStore } from '../store/modules/article'

const router = useRouter()
const authStore = useAuthStore()
const articleStore = useArticleStore()

const activeTab = ref('basic')
const profileForm = ref({
  username: '',
  email: '',
  bio: '',
  location: '',
  website: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const securityForm = ref({
  twoFactorAuth: false
})

const user = computed(() => authStore.user)
const userArticles = ref([])

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取用户角色文本
const getRoleText = (role) => {
  const roleMap = {
    admin: '管理员',
    editor: '编辑',
    user: '普通用户'
  }
  return roleMap[role] || '未知角色'
}

// 加载用户文章
  const loadUserArticles = async () => {
    try {
      const result = await articleStore.fetchUserArticles()
      // 从返回结果中获取文章列表数组
      userArticles.value = result.records || []
    } catch (error) {
      console.error('加载用户文章失败:', error)
      userArticles.value = []
    }
  }

// 删除文章
const handleDeleteArticle = async (articleId) => {
  if (confirm('确定要删除这篇文章吗？删除后无法恢复。')) {
    try {
      await articleStore.deleteArticle(articleId)
      // 从列表中移除删除的文章
      userArticles.value = userArticles.value.filter(article => article.id !== articleId)
      // 更新用户文章数
      if (user.value) {
        user.value.articleCount = Math.max(0, user.value.articleCount - 1)
      }
    } catch (error) {
      console.error('删除文章失败:', error)
    }
  }
}

// 处理头像上传
const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 这里可以实现头像上传逻辑
    console.log('上传头像:', file)
  }
}

// 更新个人资料
const handleUpdateProfile = async () => {
  try {
    await authStore.updateProfile(profileForm.value)
    // 更新成功后的处理
  } catch (error) {
    console.error('更新个人资料失败:', error)
  }
}

// 更新密码
const handleUpdatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    console.error('两次输入的密码不一致')
    return
  }
  
  try {
    await authStore.updatePassword(passwordForm.value)
    // 重置密码表单
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('更新密码失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  if (user.value) {
    profileForm.value = {
      username: user.value.username || '',
      email: user.value.email || '',
      bio: user.value.bio || '',
      location: user.value.location || '',
      website: user.value.website || ''
    }
  }
}

// 页面加载时初始化
onMounted(async () => {
  // 确保用户已登录
  const isLoggedIn = await authStore.checkLoginStatus()
  if (!isLoggedIn) {
    router.push('/login')
    return
  }
  
  // 初始化表单数据
  resetForm()
})
</script>

<style scoped>
/* 文章列表相关样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 0.875rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.user-articles-table {
  overflow-x: auto;
}

.article-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.article-table th,
.article-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.article-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.article-title-link {
  color: #333;
  text-decoration: none;
  transition: color 0.2s;
}

.article-title-link:hover {
  color: #007bff;
}

.article-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.article-status.true,
.article-status.1 {
  background-color: #d4edda;
  color: #155724;
}

.article-status.false,
.article-status.0 {
  background-color: #f8d7da;
  color: #721c24;
}

.article-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 动画效果 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style scoped>
.profile-container {
  padding: var(--spacing-xl);
  min-height: 100vh;
}

.profile-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
}

.profile-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-xl);
}

/* 侧边栏样式 */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.user-card {
  background-color: var(--bg-color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  padding: var(--spacing-xl);
  text-align: center;
}

.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto var(--spacing-lg);
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border-color);
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.avatar-container:hover .avatar-upload-overlay {
  opacity: 1;
}

.upload-button {
  color: white;
  font-size: var(--text-2xl);
  cursor: pointer;
}

.avatar-input {
  display: none;
}

.username {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.user-role {
  font-size: var(--text-sm);
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.user-email {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* 菜单样式 */
.menu-section {
  background-color: var(--bg-color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  padding: var(--spacing-lg);
}

.menu-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-base);
}

.profile-menu {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.menu-item {
  padding: var(--spacing-base);
  border: none;
  background-color: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: var(--border-radius-base);
  transition: all 0.3s ease;
  color: var(--text-secondary);
}

.menu-item:hover {
  background-color: var(--bg-color-secondary);
  color: var(--text-primary);
}

.menu-item.active {
  background-color: var(--primary-color);
  color: white;
}

/* 主内容区样式 */
.profile-main {
  background-color: var(--bg-color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-light);
  min-height: 400px;
}

.form-card {
  padding: var(--spacing-xl);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.form-textarea {
  resize: vertical;
  min-height: 100px;
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

.form-actions {
  display: flex;
  gap: var(--spacing-base);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

.loading-spin {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 安全设置样式 */
.security-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-base);
  transition: all 0.3s ease;
}

.security-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.security-info h4 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.security-info p {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .profile-sidebar {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .user-card {
    flex: 1;
    min-width: 250px;
  }
  
  .menu-section {
    flex: 1;
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: var(--spacing-lg);
  }
  
  .profile-sidebar {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-base);
  }
  
  .security-action {
    align-self: flex-end;
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] .user-card,
[data-theme="dark"] .menu-section,
[data-theme="dark"] .profile-main {
  background-color: var(--bg-color-dark);
}

[data-theme="dark"] .form-input {
  background-color: var(--bg-color-darker);
  border-color: var(--border-dark-color);
}

[data-theme="dark"] .form-input:focus {
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
}

[data-theme="dark"] .security-item {
  border-color: var(--border-dark-color);
}

[data-theme="dark"] .menu-item:hover {
  background-color: var(--bg-color-darker);
}
</style>