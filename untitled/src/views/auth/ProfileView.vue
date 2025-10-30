<template>
  <div class="profile-container">
    <h2 class="page-title">个人信息</h2>
    
    <div v-if="isLoading" class="loading-container">
      <el-skeleton animated :rows="6" />
    </div>
    
    <div v-else class="profile-content">
      <el-form 
        :model="profileForm" 
        :rules="rules" 
        ref="profileFormRef"
        label-width="120px"
        class="form"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="邮箱" prop="email">
              <el-input 
                v-model="profileForm.email" 
                type="email" 
                placeholder="请输入邮箱" 
                :disabled="updateLoading"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="昵称" prop="nickname">
              <el-input 
                v-model="profileForm.nickname" 
                placeholder="请输入昵称" 
                :disabled="updateLoading"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="个人简介" prop="bio">
              <el-input 
                v-model="profileForm.bio" 
                type="textarea" 
                placeholder="请输入个人简介" 
                :disabled="updateLoading"
                :rows="4"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="头像">
              <el-upload
          class="avatar-uploader"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleAvatarChange"
          :before-upload="beforeAvatarUpload"
          :disabled="updateLoading"
        >
                <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon" />
              </el-upload>
              <div class="upload-tip">支持 JPG、PNG 格式，文件大小不超过 2MB</div>
            </el-form-item>
          </el-col>
          
          <el-col :span="24">
            <el-form-item label="修改密码">
              <el-button 
                type="primary" 
                @click="showPasswordDialog = true"
                :disabled="updateLoading"
              >
                修改密码
              </el-button>
            </el-form-item>
          </el-col>
          
          <el-col :span="24" class="form-actions">
            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleUpdateProfile" 
                :loading="updateLoading"
              >
                保存修改
              </el-button>
              <el-button @click="handleReset" :disabled="updateLoading">
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="400px"
      :before-close="handleClosePasswordDialog"
    >
      <el-form 
        :model="passwordForm" 
        :rules="passwordRules" 
        ref="passwordFormRef"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input 
            v-model="passwordForm.currentPassword" 
            type="password" 
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClosePasswordDialog">取消</el-button>
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
    
    <!-- 成功提示 -->
    <el-message :show-close="true" v-if="successMessage" :message="successMessage" type="success" :duration="3000" />
    
    <!-- 错误提示 -->
    <el-message :show-close="true" v-if="errorMessage" :message="errorMessage" type="error" :duration="3000" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../store/modules/auth'
import { getToken } from '../../utils/auth'
import { userAPI } from '../../api/index'

const authStore = useAuthStore()
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

// 响应式数据
const isLoading = ref(true)
const updateLoading = ref(false)
const passwordLoading = ref(false)
const showPasswordDialog = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// 用户信息表单
const profileForm = reactive({
  username: '',
  email: '',
  nickname: '',
  bio: '',
  avatar: ''
})

// 修改密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 获取用户信息
const user = computed(() => authStore.user)

// 表单验证规则
const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  nickname: [
    { max: 50, message: '昵称长度不能超过 50 个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介长度不能超过 200 个字符', trigger: 'blur' }
  ]
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
      // 调用API获取用户信息
      const response = await userAPI.getCurrentUser()
      
      if (response && response.status === 'SUCCESS' && response.data) {
        // 填充表单数据
        profileForm.id = response.data.id;
        profileForm.username = response.data.username || '';
        profileForm.email = response.data.email || '';
        profileForm.nickname = response.data.nickname || response.data.username || '';
        profileForm.bio = response.data.bio || '';
        // 更新头像
        profileForm.avatar = response.data.avatar || '';
      } else {
        // 如果API返回异常，提供默认模拟数据
        const mockData = {
          username: '访客用户',
          email: 'guest@example.com',
          nickname: '新用户',
          bio: '这是一个默认的个人简介',
          avatar: ''
        }
        Object.assign(profileForm, mockData)
        ElMessage.info('使用模拟数据')
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      // 在开发环境下，如果是未登录或后端服务未启动，提供友好提示而不是错误消息
      if (process.env.NODE_ENV === 'development') {
        console.warn('提示: 可能是后端服务未启动或未登录状态');
        ElMessage.info('开发环境下显示模拟数据');
      } else {
        ElMessage.error('加载用户信息失败，请检查登录状态');
      }
      // 提供默认模拟数据
      const mockData = {
        username: '访客用户',
        email: 'guest@example.com',
        nickname: '新用户',
        bio: '这是一个默认的个人简介',
        avatar: ''
      }
      Object.assign(profileForm, mockData)
    } finally {
      isLoading.value = false
    }
  }

// 更新个人资料
const handleUpdateProfile = async () => {
  updateLoading.value = true
  try {
    // 表单验证
    await profileFormRef.value.validate()
    
    // 准备更新数据 - 根据后端API文档，使用正确的字段名
    const updateData = {
      nickname: profileForm.nickname,
      email: profileForm.email,
      bio: profileForm.bio
    }
    
    // 调用API更新个人资料 - 根据后端API文档，使用PUT方法
    const response = await userAPI.updateUser(updateData)
    
    // 根据后端API文档，响应直接返回更新后的用户对象
    if (response) {
      ElMessage.success('个人资料更新成功')
      // 更新本地状态
      Object.assign(profileForm, response)
    } else {
      ElMessage.error('个人资料更新失败')
    }
  } catch (error) {
    console.error('更新个人资料失败:', error)
    if (error.response && error.response.status === 401) {
      ElMessage.error('未授权，请重新登录')
    } else {
      ElMessage.error('更新个人资料失败，请重试')
    }
  } finally {
    updateLoading.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (user.value) {
    const { email, nickname, bio, avatar } = user.value
    Object.assign(profileForm, { email, nickname, bio, avatar })
  }
  if (profileFormRef.value) {
    profileFormRef.value.clearValidate()
  }
}

// 处理头像上传
const handleAvatarChange = async (uploadFile) => {
  if (beforeAvatarUpload(uploadFile.raw)) {
    try {
      // 创建FormData对象上传文件
      const formData = new FormData()
      formData.append('file', uploadFile.raw)
      
      // 调用头像上传API
      const result = await userAPI.updateAvatar(formData)
      
      if (result && result.status === 'SUCCESS' && result.data) {
        profileForm.avatar = result.data
        ElMessage.success('头像上传成功')
      } else {
        throw new Error(result?.message || '上传失败')
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      ElMessage.error(error.message || '头像上传失败')
    }
  }
}

// 头像上传前的校验
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('只能上传JPG/PNG格式的图片！')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB！')
    return false
  }
  
  return true
}

// 更新密码
const handleUpdatePassword = async () => {
  passwordLoading.value = true
  try {
    // 表单验证
    await passwordFormRef.value.validate()
    
    // 准备密码数据 - 根据后端API文档，使用正确的字段名
      const passwordData = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }
      // 调用API修改密码 - 根据后端API文档，使用PUT方法到/api/users/change-password
    const response = await userAPI.changePassword(passwordData)
    
    // 根据后端API文档，如果成功返回200状态码，无返回数据
    ElMessage.success('密码修改成功')
    
    // 关闭对话框并重置表单
    handleClosePasswordDialog()
    
    // 3秒后登出用户
    setTimeout(() => {
      authStore.logout()
    }, 3000)
  } catch (error) {
    console.error('修改密码失败:', error)
    if (error.response) {
      if (error.response.status === 401) {
        ElMessage.error('当前密码错误')
      } else if (error.response.status === 400) {
        ElMessage.error('密码格式不符合要求')
      } else {
        ElMessage.error('修改密码失败，请重试')
      }
    } else {
      ElMessage.error('修改密码失败，请重试')
    }
  } finally {
    passwordLoading.value = false
  }
}

// 关闭密码对话框
const handleClosePasswordDialog = () => {
  showPasswordDialog.value = false
  
  // 重置表单
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
}

// 监听用户信息变化
watch(user, (newUser) => {
  if (newUser) {
    const { username, email, nickname, bio, avatar } = newUser
    Object.assign(profileForm, { username, email, nickname, bio, avatar })
  }
}, { deep: true })

// 页面加载时初始化
onMounted(() => {
  initUserInfo()
})
</script>

<style scoped>
.profile-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.page-title {
  margin-bottom: 24px;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.loading-container {
  padding: 20px;
}

.form {
  max-width: 600px;
}

.form-actions {
  margin-top: 16px;
}

.avatar-uploader {
  display: block;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 140px;
  height: 140px;
  line-height: 140px;
  text-align: center;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.avatar-uploader-icon:hover {
  border-color: #409eff;
}

.avatar {
  width: 140px;
  height: 140px;
  display: block;
  border-radius: 6px;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>