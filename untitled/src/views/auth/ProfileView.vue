<template>
  <div class="profile-page">
    <!-- 页面头部 -->
    <div class="profile-header">
      <h1 class="profile-title">个人信息</h1>
      <p class="profile-subtitle">管理您的个人资料和账户设置</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="profile-content">
      <!-- 左侧边栏 - 个人信息卡片 -->
      <div class="profile-sidebar">
        <div class="user-card">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <el-avatar 
              :size="120" 
              :src="profileForm.avatar || defaultAvatar" 
              class="user-avatar"
            >
              {{ userInitial }}
            </el-avatar>
            <div class="avatar-upload-overlay">
              <el-button 
                type="primary" 
                size="small" 
                circle 
                icon="el-icon-upload"
                @click.stop="triggerAvatarUpload"
                :disabled="updateLoading"
              />
            </div>
            <input 
              ref="avatarInput" 
              type="file" 
              accept="image/*" 
              style="display: none"
              @change="handleAvatarUpload"
            />
            <p class="avatar-hint">点击头像可更换</p>
          </div>

          <!-- 用户基本信息 -->
          <div class="user-info">
            <h3 class="username">{{ profileForm.nickname || profileForm.username }}</h3>
            <p class="user-email">{{ profileForm.email }}</p>
            <p class="user-role" :class="roleClass">{{ userRole }}</p>
          </div>

          <!-- 统计信息 -->
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userStats.articleCount }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStats.commentCount }}</span>
              <span class="stat-label">评论</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStats.favoriteCount }}</span>
              <span class="stat-label">收藏</span>
            </div>
          </div>

          <!-- 账户操作 -->
          <div class="account-actions">
            <el-button 
              type="primary" 
              full-width 
              @click="showPasswordDialog = true"
              :disabled="updateLoading"
            >
              <el-icon><Lock /></el-icon>
              修改密码
            </el-button>
            <el-button 
              type="danger" 
              text 
              full-width 
              @click="handleLogout"
              :disabled="updateLoading"
            >
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧主内容 - 表单区域 -->
      <div class="profile-main">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-container">
          <el-skeleton animated :rows="8" class="profile-skeleton" />
        </div>

        <!-- 表单内容 -->
        <el-card v-else shadow="hover" class="profile-form-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">基本资料</span>
              <span class="last-update" v-if="lastUpdated">
                最后更新: {{ formatDate(lastUpdated) }}
              </span>
            </div>
          </template>

          <el-form 
            ref="profileFormRef" 
            :model="profileForm" 
            :rules="rules" 
            label-width="110px"
            class="profile-form"
          >
            <!-- 第一行：用户名和昵称 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" class="required-field">
                  <el-input 
                    v-model="profileForm.username" 
                    disabled 
                    placeholder="用户名不可修改"
                    class="readonly-input"
                  />
                  <div class="form-hint">用户名一旦设置不可修改</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="昵称" prop="nickname" class="required-field">
                  <el-input 
                    v-model="profileForm.nickname" 
                    placeholder="请输入昵称"
                    :disabled="updateLoading"
                    maxlength="50"
                    show-word-limit
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 第二行：邮箱和手机号 -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email" class="required-field">
                  <el-input 
                    v-model="profileForm.email" 
                    type="email" 
                    placeholder="请输入邮箱地址"
                    :disabled="updateLoading"
                  />
                </el-form-item>
              </el-col>
              <!-- 移除手机号字段 -->
            </el-row>

            <!-- 个人简介 -->
            <el-row>
              <el-col :span="24">
                <el-form-item label="个人简介" prop="bio">
                  <el-input 
                    v-model="profileForm.bio" 
                    type="textarea" 
                    :rows="4" 
                    placeholder="介绍一下自己吧..."
                    :disabled="updateLoading"
                    maxlength="200"
                    show-word-limit
                  />
                  <div class="form-hint">简洁的个人介绍，让大家更好地了解你</div>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 移除网站和所在地字段 -->

            <!-- 表单操作按钮 -->
            <el-form-item class="form-actions">
              <el-button 
                type="primary" 
                @click="handleSubmit" 
                :loading="updateLoading"
                size="large"
              >
                <el-icon v-if="!updateLoading"><Check /></el-icon>
                保存修改
              </el-button>
              <el-button 
                @click="handleReset" 
                :disabled="updateLoading"
                size="large"
              >
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="480px"
      :close-on-click-modal="false"
      :before-close="handleClosePasswordDialog"
    >
      <el-form 
        :model="passwordForm" 
        :rules="passwordRules" 
        ref="passwordFormRef"
        label-width="120px"
        class="password-form"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            placeholder="请输入当前密码"
            show-password
            :disabled="passwordLoading"
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            show-password
            :disabled="passwordLoading"
          />
          <div class="password-strength" v-if="passwordForm.newPassword">
            <div 
              class="strength-bar" 
              :class="getPasswordStrengthClass()"
              :style="{ width: getPasswordStrengthWidth() }"
            ></div>
            <span class="strength-text">{{ getPasswordStrengthText() }}</span>
          </div>
          <div class="form-hint">密码长度6-20位，建议包含字母、数字和特殊字符</div>
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
            :disabled="passwordLoading"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClosePasswordDialog" :disabled="passwordLoading">
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="handleUpdatePassword" 
            :loading="passwordLoading"
          >
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../../store/modules/auth'
import { userAPI } from '../../api/index'
import { 
  Lock, 
  SwitchButton, 
  Check, 
  Refresh 
} from '@element-plus/icons-vue'

const authStore = useAuthStore()
const profileFormRef = ref(null)
const passwordFormRef = ref(null)
const avatarInput = ref(null)

// 响应式数据
const isLoading = ref(true)
const updateLoading = ref(false)
const passwordLoading = ref(false)
const showPasswordDialog = ref(false)
const lastUpdated = ref('')
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

// 用户信息表单 - 扩展字段
const profileForm = reactive({
  id: '',
  username: '',
  email: '',
  nickname: '',
  bio: '',
  avatar: ''
  // 移除phone, website, location字段
})

// 修改密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 用户统计信息
const userStats = reactive({
  articleCount: 0,
  commentCount: 0,
  favoriteCount: 0
})

// 计算属性：获取用户信息
const user = computed(() => authStore.user || {})

// 计算属性：用户头像首字母
const userInitial = computed(() => {
  const name = profileForm.nickname || profileForm.username || '用'
  return name.charAt(0).toUpperCase()
})

// 计算属性：用户角色显示
const userRole = computed(() => {
  const role = user.value.role || 'user'
  const roleMap = {
    admin: '管理员',
    editor: '编辑',
    user: '普通用户'
  }
  return roleMap[role] || '未知角色'
})

// 计算属性：角色样式类
const roleClass = computed(() => {
  const role = user.value.role || 'user'
  return `role-${role}`
})

// 表单验证规则
const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 50, message: '昵称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介长度不能超过 200 个字符', trigger: 'blur' }
  ]
  // 移除phone和website验证规则
}

// 密码验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 初始化用户信息
const initUserInfo = async () => {
  isLoading.value = true
  try {
    // 等待authStore初始化
    if (!authStore.isInitialized) {
      await authStore.initializeAuth()
    }
    
    // 尝试从authStore获取用户信息
    if (authStore.user) {
      updateFormWithUser(authStore.user)
    } else {
      // 如果store中没有用户信息，尝试从API获取
      const response = await userAPI.getCurrentUser()
      
      if (response && response.data) {
        updateFormWithUser(response.data)
      } else {
        // 使用默认模拟数据
        setDefaultUserData()
      }
    }
    
    // 加载用户统计信息
    await loadUserStats()
    
  } catch (error) {
    console.error('加载用户信息失败:', error)
    // 显示友好错误提示
    if (process.env.NODE_ENV === 'development') {
      ElMessage.info('开发环境下显示示例数据')
    } else {
      ElMessage.error('加载用户信息失败，请刷新页面重试')
    }
    // 设置默认数据
    setDefaultUserData()
  } finally {
    isLoading.value = false
  }
}

// 使用用户数据更新表单
const updateFormWithUser = (userData) => {
  if (!userData) return
  
  // 深度拷贝用户数据，避免直接修改store
  const userCopy = JSON.parse(JSON.stringify(userData))
  
  // 更新表单数据
  profileForm.id = userCopy.id || ''
  profileForm.username = userCopy.username || '未知用户'
  profileForm.email = userCopy.email || ''
  profileForm.nickname = userCopy.nickname || userCopy.username || '未设置昵称'
  profileForm.bio = userCopy.bio || ''
  profileForm.avatar = userCopy.avatar || ''
  // 移除phone, website, location字段
  
  // 更新最后修改时间
  lastUpdated.value = userCopy.updatedAt || userCopy.updateTime || ''
}

// 设置默认用户数据
const setDefaultUserData = () => {
  const mockData = {
    username: '示例用户',
    email: 'example@demo.com',
    nickname: '新用户',
    bio: '这是一个默认的个人简介，您可以在这里介绍自己。',
    avatar: ''
    // 移除phone, website, location字段
  }
  Object.assign(profileForm, mockData)
}

// 加载用户统计信息
const loadUserStats = async () => {
  try {
    // 首先尝试从用户信息中获取统计数据
    const currentUser = user.value;
    console.log('当前用户信息:', currentUser);
    
    // 如果用户信息中包含统计数据，则使用这些数据
    if (currentUser) {
      userStats.articleCount = currentUser.articleCount || 0;
      userStats.commentCount = currentUser.commentCount || 0;
      userStats.favoriteCount = currentUser.favoriteCount || 0;
      console.log('从用户信息中获取统计数据:', userStats);
    } else {
      // 如果没有用户信息，设置为0
      userStats.articleCount = 0;
      userStats.commentCount = 0;
      userStats.favoriteCount = 0;
      console.log('用户信息未获取到，统计数据设置为0');
    }
    
    // 专门从API获取收藏数量
    try {
      console.log('开始调用getUserFavorites API');
      const favoritesResponse = await userAPI.getUserFavorites({ page: 1, pageSize: 1 });
      console.log('getUserFavorites API响应:', favoritesResponse);
      
      // 处理响应数据 - 检查两种可能的数据结构
      if (favoritesResponse) {
        // 情况1: 响应可能是直接的数据对象（根据日志显示）
        if (typeof favoritesResponse.total !== 'undefined') {
          userStats.favoriteCount = favoritesResponse.total;
          console.log('情况1: 直接从响应获取total值:', userStats.favoriteCount);
        }
        // 情况2: 响应可能包含data字段（标准格式）
        else if (favoritesResponse.data && typeof favoritesResponse.data.total !== 'undefined') {
          userStats.favoriteCount = favoritesResponse.data.total;
          console.log('情况2: 从data字段获取total值:', userStats.favoriteCount);
        }
      }
    } catch (favError) {
      console.error('获取收藏数量失败:', favError);
      if (favError.response) {
        console.log('错误响应:', favError.response.data);
      }
    }
    
    // 最终验证统计数据
    console.log('最终统计数据:', userStats);
    
  } catch (error) {
    console.error('加载用户统计信息失败:', error);
    // 出错时设置为0
    userStats.articleCount = 0;
    userStats.commentCount = 0;
    userStats.favoriteCount = 0;
  }
}

// 触发头像上传
const triggerAvatarUpload = () => {
  if (avatarInput.value) {
    avatarInput.value.click()
  }
}

// 处理头像上传
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件
  if (!validateImageFile(file)) {
    // 清空input，允许用户重新选择
    event.target.value = ''
    return
  }
  
  try {
    updateLoading.value = true
    
    // 创建FormData对象
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'avatar')
    
    // 上传头像
    const response = await userAPI.updateAvatar(formData)
    
    if (response && response.data) {
      profileForm.avatar = response.data
      ElMessage.success('头像上传成功')
      
      // 更新authStore中的用户信息
      if (authStore.user) {
        authStore.user.avatar = response.data
      }
    } else {
      throw new Error('上传失败：未返回有效数据')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error(error.message || '头像上传失败，请重试')
  } finally {
    updateLoading.value = false
    // 清空input，允许用户重新选择
    event.target.value = ''
  }
}

// 验证图片文件
const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 2 * 1024 * 1024 // 2MB
  
  if (!validTypes.includes(file.type)) {
    ElMessage.error('只支持 JPG、PNG、WebP 格式的图片')
    return false
  }
  
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  
  return true
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    await profileFormRef.value.validate()
    
    updateLoading.value = true
    
    // 准备更新数据
    const updateData = {
      id: profileForm.id, // 添加用户ID
      nickname: profileForm.nickname,
      email: profileForm.email,
      bio: profileForm.bio
      // 移除phone, website, location字段
    }
    
    // 调用API更新个人资料
    const response = await userAPI.updateUser(updateData)
    
    if (response) {
      // 更新本地数据
      if (response.data) {
        updateFormWithUser(response.data)
      }
      
      // 更新authStore
      if (authStore.user) {
        Object.assign(authStore.user, updateData)
      }
      
      ElMessage.success('个人资料更新成功')
      lastUpdated.value = new Date().toISOString()
    } else {
      throw new Error('更新失败')
    }
  } catch (error) {
    console.error('更新个人资料失败:', error)
    
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        ElMessage.error('未授权，请重新登录')
        // 可以考虑在这里触发登出
      } else if (status === 400) {
        ElMessage.error('输入数据有误，请检查后重试')
      } else {
        ElMessage.error('更新失败，请稍后重试')
      }
    } else {
      ElMessage.error(error.message || '更新失败，请重试')
    }
  } finally {
    updateLoading.value = false
  }
}

// 重置表单
const handleReset = async () => {
  // 清空验证状态
  if (profileFormRef.value) {
    profileFormRef.value.clearValidate()
  }
  
  // 从原始数据重置
  if (authStore.user) {
    updateFormWithUser(authStore.user)
  } else {
    // 重新加载数据
    await initUserInfo()
  }
  
  ElMessage.success('表单已重置')
}

// 获取密码强度
const getPasswordStrength = () => {
  const password = passwordForm.newPassword
  if (!password) return 0
  
  let strength = 0
  
  // 长度检查
  if (password.length >= 8) strength++
  
  // 包含数字
  if (/\d/.test(password)) strength++
  
  // 包含小写字母
  if (/[a-z]/.test(password)) strength++
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++
  
  // 包含特殊字符
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return strength
}

// 获取密码强度类
const getPasswordStrengthClass = () => {
  const strength = getPasswordStrength()
  if (strength <= 2) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
}

// 获取密码强度宽度
const getPasswordStrengthWidth = () => {
  const strength = getPasswordStrength()
  return `${(strength / 5) * 100}%`
}

// 获取密码强度文本
const getPasswordStrengthText = () => {
  const strength = getPasswordStrength()
  if (strength <= 2) return '弱'
  if (strength <= 3) return '中'
  if (strength <= 4) return '良好'
  return '强'
}

// 更新密码
const handleUpdatePassword = async () => {
  try {
    // 验证表单
    await passwordFormRef.value.validate()
    
    passwordLoading.value = true
    
    // 准备密码数据
    const passwordData = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }
    
    // 调用API修改密码
    await userAPI.changePassword(passwordData)
    
    ElMessage.success({
      message: '密码修改成功，将在3秒后重新登录',
      duration: 2500
    })
    
    // 关闭对话框
    handleClosePasswordDialog()
    
    // 3秒后登出用户
    setTimeout(() => {
      authStore.logout()
    }, 3000)
  } catch (error) {
    console.error('修改密码失败:', error)
    
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        ElMessage.error('当前密码错误')
      } else if (status === 400) {
        ElMessage.error('密码格式不符合要求')
      } else {
        ElMessage.error('修改密码失败，请重试')
      }
    } else {
      ElMessage.error(error.message || '修改密码失败，请重试')
    }
  } finally {
    passwordLoading.value = false
  }
}

// 关闭密码对话框
const handleClosePasswordDialog = () => {
  showPasswordDialog.value = false
  
  // 重置表单
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  
  // 清空验证状态
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    const confirmResult = await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (confirmResult === 'confirm') {
      await authStore.logout()
    }
  } catch (error) {
    // 用户取消操作，不做处理
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return ''
  }
}

// 监听用户信息变化
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    updateFormWithUser(newUser)
  }
}, { deep: true })

// 页面加载时初始化
onMounted(() => {
  initUserInfo()
})
</script>

<style scoped>
/* CSS变量定义 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  --border-radius: 8px;
  --shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --transition-all: all 0.3s ease;
}

/* 暗黑主题变量 */
[data-theme="dark"] {
  --bg-card-dark: #1f1f1f;
  --bg-input-dark: #2c2c2c;
  --text-primary-dark: #ffffff;
  --text-secondary-dark: #c0c4cc;
  --border-color-dark: #4e4e4e;
}

/* 页面容器 */
.profile-page {
  min-height: calc(100vh - 60px);
  padding: 30px 20px;
  background-color: #f5f7fa;
}

/* 页面头部 */
.profile-header {
  margin-bottom: 30px;
  text-align: center;
}

.profile-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.profile-subtitle {
  font-size: 14px;
  color: #909399;
}

/* 主要内容区域 */
.profile-content {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 侧边栏 */
.profile-sidebar {
  flex-shrink: 0;
  width: 320px;
}

/* 用户卡片 */
.user-card {
  background: #fff;
  border-radius: var(--border-radius);
  padding: 30px 20px;
  box-shadow: var(--shadow-light);
  text-align: center;
  transition: var(--transition-all);
}

.user-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 头像区域 */
.avatar-section {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.user-avatar {
  transition: var(--transition-all);
  cursor: pointer;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.avatar-upload-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  transform: translate(25%, 25%);
  opacity: 0;
  transition: var(--transition-all);
}

.avatar-section:hover .avatar-upload-overlay {
  opacity: 1;
}

.avatar-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

/* 用户信息 */
.user-info {
  margin-bottom: 20px;
}

.username {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.user-email {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.user-role {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-admin {
  background: #fde2e2;
  color: var(--danger-color);
}

.role-editor {
  background: #ebe8ff;
  color: #86909c;
}

.role-user {
  background: #e1f3d8;
  color: var(--success-color);
}

/* 统计信息 */
.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

/* 账户操作 */
.account-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 主内容区域 */
.profile-main {
  flex: 1;
  min-width: 0;
}

/* 加载状态 */
.loading-container {
  background: #fff;
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--shadow-light);
}

.profile-skeleton {
  max-width: 100%;
}

/* 表单卡片 */
.profile-form-card {
  border-radius: var(--border-radius);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.last-update {
  font-size: 12px;
  color: #909399;
}

/* 表单样式 */
.profile-form {
  padding: 20px 0;
}

.required-field .el-form-item__label::before {
  content: '*';
  color: var(--danger-color);
  margin-right: 4px;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.readonly-input {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  gap: 15px;
}

/* 密码表单 */
.password-form {
  padding: 10px 0;
}

.password-strength {
  margin-top: 8px;
  position: relative;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  background-color: #ebeef5;
  margin-bottom: 4px;
  transition: var(--transition-all);
}

.strength-bar.weak {
  background-color: var(--danger-color);
}

.strength-bar.medium {
  background-color: var(--warning-color);
}

.strength-bar.strong {
  background-color: var(--success-color);
}

.strength-text {
  font-size: 12px;
  color: #909399;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .profile-content {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
  }
  
  .user-card {
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 20px 15px;
  }
  
  .profile-header {
    margin-bottom: 20px;
  }
  
  .profile-title {
    font-size: 24px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .user-stats {
    padding: 15px 0;
  }
  
  .stat-value {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .user-card {
    padding: 20px 15px;
  }
  
  .profile-form {
    padding: 15px 0;
  }
  
  .el-form--label-top .el-form-item__label {
    text-align: left;
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] .profile-page {
  background-color: #0a0a0a;
}

[data-theme="dark"] .user-card,
[data-theme="dark"] .profile-form-card,
[data-theme="dark"] .loading-container {
  background-color: var(--bg-card-dark);
  border-color: var(--border-color-dark);
}

[data-theme="dark"] .profile-title,
[data-theme="dark"] .username,
[data-theme="dark"] .stat-value,
[data-theme="dark"] .card-title {
  color: var(--text-primary-dark);
}

[data-theme="dark"] .profile-subtitle,
[data-theme="dark"] .user-email,
[data-theme="dark"] .stat-label,
[data-theme="dark"] .last-update,
[data-theme="dark"] .form-hint,
[data-theme="dark"] .strength-text,
[data-theme="dark"] .avatar-hint {
  color: var(--text-secondary-dark);
}

[data-theme="dark"] .user-stats {
  border-color: var(--border-color-dark);
}

[data-theme="dark"] .readonly-input {
  background-color: var(--bg-input-dark);
}

/* 动画效果 */
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

.user-card,
.profile-form-card {
  animation: fadeIn 0.5s ease-out;
}

/* 滚动条样式 */
.profile-page::-webkit-scrollbar {
  width: 8px;
}

.profile-page::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.profile-page::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.profile-page::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

[data-theme="dark"] .profile-page::-webkit-scrollbar-track {
  background: #1f1f1f;
}

[data-theme="dark"] .profile-page::-webkit-scrollbar-thumb {
  background: #4e4e4e;
}

[data-theme="dark"] .profile-page::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>