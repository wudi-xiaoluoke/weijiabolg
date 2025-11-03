<template>
  <div class="profile-container">
    <el-card shadow="hover" class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>个人配置</h2>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 个人信息 -->
        <el-tab-pane label="个人信息" name="info">
          <div class="profile-info-section">
            <div class="avatar-section">
              <el-avatar
                :size="100"
                :src="user.avatar || userProfile.avatar || defaultAvatar"
                class="user-avatar"
              >
                {{ userInitial }}
              </el-avatar>
              <el-button type="primary" @click="triggerAvatarUpload" size="large" class="avatar-upload-btn touch-friendly">
                <el-icon><UploadFilled /></el-icon>
                更换头像
              </el-button>
              <input
                type="file"
                ref="fileInput"
                style="display: none"
                accept="image/*"
                @change="handleAvatarUpload"
              />
            </div>
            
            <el-form ref="profileForm" :model="userProfile" label-width="120px" class="profile-form touch-friendly">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userProfile.username" placeholder="请输入用户名" size="large" class="touch-friendly"/>
              </el-form-item>
              
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="userProfile.realName" placeholder="请输入真实姓名" size="large" class="touch-friendly"/>
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userProfile.email" type="email" placeholder="请输入邮箱" size="large" class="touch-friendly"/>
              </el-form-item>
              
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="userProfile.phone" placeholder="请输入手机号" size="large" class="touch-friendly"/>
              </el-form-item>
              
              <el-form-item label="个人简介">
                <el-input
                  v-model="userProfile.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入个人简介"
                  size="large"
                  class="touch-friendly"
                />
              </el-form-item>
              
              <el-form-item label="所在地区">
                <el-cascader
                  v-model="userProfile.region"
                  :options="regionOptions"
                  placeholder="请选择地区"
                  size="large"
                  class="touch-friendly"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        
        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form ref="securityForm" label-width="120px" class="security-form touch-friendly">
            <el-form-item label="修改密码">
              <el-button type="primary" @click="showChangePasswordDialog = true" size="large" class="touch-friendly">
                <el-icon><Key /></el-icon>
                修改密码
              </el-button>
            </el-form-item>
            
            <el-form-item label="两步验证">
              <el-switch v-model="securitySettings.twoFactorEnabled" size="large" class="touch-friendly" />
              <div v-if="securitySettings.twoFactorEnabled" class="setting-description">
                两步验证已启用，提高账户安全性
              </div>
            </el-form-item>
            
            <el-form-item label="登录通知">
              <el-switch v-model="securitySettings.loginNotifications" size="large" class="touch-friendly" />
              <div v-if="securitySettings.loginNotifications" class="setting-description">
                当检测到新设备登录时发送通知
              </div>
            </el-form-item>
            
            <el-form-item label="设备管理">
              <el-button type="primary" @click="showDevicesDialog = true" size="large" class="touch-friendly">
                <el-icon><Monitor /></el-icon>
                管理登录设备
              </el-button>
            </el-form-item>
            
            <el-form-item label="登录历史">
              <el-button type="primary" @click="showLoginHistoryDialog = true" size="large" class="touch-friendly">
                <el-icon><Timer /></el-icon>
                查看登录历史
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 偏好设置 -->
        <el-tab-pane label="偏好设置" name="preferences">
          <el-form ref="preferencesForm" :model="preferences" label-width="120px" class="preferences-form touch-friendly">
            <el-form-item label="界面语言">
              <el-select v-model="preferences.language" placeholder="选择语言" size="large" class="touch-friendly">
                <el-option label="简体中文" value="zh-CN"></el-option>
                <el-option label="English" value="en-US"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="默认视图">
              <el-radio-group v-model="preferences.defaultView" size="large" class="touch-friendly">
                <el-radio-button label="list">列表视图</el-radio-button>
                <el-radio-button label="grid">网格视图</el-radio-button>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="文件排序">
              <el-select v-model="preferences.fileSort" placeholder="选择排序方式" size="large" class="touch-friendly">
                <el-option label="按名称" value="name"></el-option>
                <el-option label="按大小" value="size"></el-option>
                <el-option label="按修改时间" value="modified"></el-option>
              </el-select>
              <el-switch
                v-model="preferences.sortDescending"
                inline-prompt
                active-text="降序"
                inactive-text="升序"
                size="large"
                class="sort-order-switch touch-friendly"
              />
            </el-form-item>
            
            <el-form-item label="自动保存">
              <el-switch v-model="preferences.autoSave" size="large" class="touch-friendly" />
              <div v-if="preferences.autoSave" class="setting-description">
                自动保存编辑的文档
              </div>
            </el-form-item>
            
            <el-form-item label="显示隐藏文件">
              <el-switch v-model="preferences.showHiddenFiles" size="large" class="touch-friendly" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <div class="form-actions">
        <el-button @click="resetProfile" size="large" class="touch-friendly">重置</el-button>
        <el-button type="primary" @click="saveProfile" :loading="savingProfile" size="large" class="touch-friendly">保存设置</el-button>
      </div>
    </el-card>
  </div>
  
  <!-- 修改密码对话框 -->
  <el-dialog
    v-model="showChangePasswordDialog"
    title="修改密码"
    width="400px"
    :close-on-click-modal="false"
  >
    <el-form :model="passwordForm" label-width="100px" class="password-form touch-friendly">
      <el-form-item label="当前密码">
        <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password size="large" class="touch-friendly"/>
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password size="large" class="touch-friendly"/>
        <div class="password-tips">密码长度至少8位，包含字母和数字</div>
      </el-form-item>
      <el-form-item label="确认密码">
        <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" show-password size="large" class="touch-friendly"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showChangePasswordDialog = false" class="touch-friendly">取消</el-button>
      <el-button type="primary" @click="changePassword" :loading="changingPassword" class="touch-friendly">确认修改</el-button>
    </template>
  </el-dialog>
  
  <!-- 登录设备对话框 -->
  <el-dialog
    v-model="showDevicesDialog"
    title="登录设备"
    width="700px"
    :close-on-click-modal="false"
  >
    <el-table :data="loginDevices" style="width: 100%">
      <el-table-column prop="device" label="设备" width="180"></el-table-column>
      <el-table-column prop="browser" label="浏览器" width="180"></el-table-column>
      <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
      <el-table-column prop="loginTime" label="登录时间" width="180"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'warning'">
            {{ scope.row.status === 'active' ? '当前' : '其他' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="scope">
          <el-button 
            type="danger" 
            text 
            @click="logoutDevice(scope.row.id)"
            :disabled="scope.row.status === 'active'"
            class="touch-friendly"
          >
            登出
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="showDevicesDialog = false" class="touch-friendly">关闭</el-button>
    </template>
  </el-dialog>
  
  <!-- 登录历史对话框 -->
  <el-dialog
    v-model="showLoginHistoryDialog"
    title="登录历史"
    width="700px"
    :close-on-click-modal="false"
  >
    <el-table :data="loginHistory" style="width: 100%">
      <el-table-column prop="device" label="设备" width="180"></el-table-column>
      <el-table-column prop="browser" label="浏览器" width="180"></el-table-column>
      <el-table-column prop="ip" label="IP地址" width="150"></el-table-column>
      <el-table-column prop="location" label="位置" width="150"></el-table-column>
      <el-table-column prop="loginTime" label="登录时间" width="180"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
            {{ scope.row.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="showLoginHistoryDialog = false" class="touch-friendly">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled, Key, Monitor, Timer } from '@element-plus/icons-vue';
import { getToken } from '../utils/auth';
import { debugLocalStorage } from '../utils/debugAuth';
import { useAuthStore } from '../store/modules/auth';

// 存储实例
const authStore = useAuthStore();

// 响应式数据
const activeTab = ref('info');
const savingProfile = ref(false);
const changingPassword = ref(false);
const showChangePasswordDialog = ref(false);
const showDevicesDialog = ref(false);
const showLoginHistoryDialog = ref(false);
const fileInput = ref(null);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 计算属性：直接从authStore获取用户信息
const user = computed(() => {
  const userData = authStore.user || {};
  console.log('computed user:', userData);
  return userData;
});

// 用户个人信息（使用临时对象存储修改，不直接修改store状态）
const userProfile = ref({
  username: '',
  realName: '',
  email: '',
  phone: '',
  bio: '',
  avatar: '',
  region: [],
  website: '',
  location: ''
});

// 安全设置
const securitySettings = reactive({
  twoFactorEnabled: false,
  loginNotifications: true
});

// 偏好设置
const preferences = reactive({
  language: 'zh-CN',
  defaultView: 'list',
  fileSort: 'name',
  sortDescending: false,
  autoSave: true,
  showHiddenFiles: false
});

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 地区选项（模拟数据）
const regionOptions = ref([
  {
    value: 'beijing',
    label: '北京',
    children: [
      { value: 'haidian', label: '海淀区' },
      { value: 'chaoyang', label: '朝阳区' }
    ]
  },
  {
    value: 'shanghai',
    label: '上海',
    children: [
      { value: 'pudong', label: '浦东新区' },
      { value: 'huangpu', label: '黄浦区' }
    ]
  }
]);

// 登录设备（模拟数据）
const loginDevices = ref([
  {
    id: '1',
    device: 'Windows 10',
    browser: 'Chrome 108.0',
    ip: '192.168.1.1',
    loginTime: '2023-12-01 14:30:00',
    status: 'active'
  },
  {
    id: '2',
    device: 'iPhone 13',
    browser: 'Safari 16.0',
    ip: '10.0.0.1',
    loginTime: '2023-11-30 10:15:00',
    status: 'inactive'
  }
]);

// 登录历史（模拟数据）
const loginHistory = ref([
  {
    id: '1',
    device: 'Windows 10',
    browser: 'Chrome 108.0',
    ip: '192.168.1.1',
    location: '北京',
    loginTime: '2023-12-01 14:30:00',
    status: 'success'
  },
  {
    id: '2',
    device: 'iPhone 13',
    browser: 'Safari 16.0',
    ip: '10.0.0.1',
    location: '上海',
    loginTime: '2023-11-30 10:15:00',
    status: 'success'
  },
  {
    id: '3',
    device: 'Android',
    browser: 'Firefox 107.0',
    ip: '203.0.113.1',
    location: '未知',
    loginTime: '2023-11-29 22:45:00',
    status: 'failed'
  }
]);

// 计算属性
const userInitial = computed(() => {
  const name = user.value.realName || user.value.username || userProfile.value.realName || userProfile.value.username || 'U';
  return name.charAt(0);
});

// 生命周期钩子
onMounted(async () => {
  // 先等待authStore初始化
  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
    console.log('authStore初始化完成');
  }
  
  // 加载用户信息
  await loadUserProfile();
  
  // 添加一个小延迟后再次尝试加载，确保数据完全更新
  setTimeout(async () => {
    console.log('延迟后再次检查用户信息');
    if (!userProfile.value.username || userProfile.value.username === '未知用户') {
      console.log('用户信息不完整，再次尝试加载');
      await loadUserProfile();
    }
  }, 500);
  
  // 加载安全设置
  await loadSecuritySettings();
  
  // 打印当前认证状态
  console.log('页面加载完成，当前认证状态:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    userProfile: userProfile.value
  });
  
  // 加载偏好设置
  await loadPreferences();
});

// 方法
const loadUserProfile = async () => {
  try {
    console.log('开始加载用户信息...');
    
    // 调用调试函数检查localStorage
    debugLocalStorage();
    
    // 检查认证状态
    console.log('认证状态检查:', {
      isAuthenticated: authStore.isAuthenticated,
      hasToken: !!getToken(),
      userExists: !!authStore.user
    });
    
    // 调用fetchUserProfile方法从API获取用户信息并更新authStore
    const userData = await authStore.fetchUserProfile();
    console.log('fetchUserProfile返回值:', userData);
    console.log('fetchUserProfile完成后，authStore中的user对象:', authStore.user);
    
    // 将store中的用户信息同步到本地编辑状态
    const currentUser = authStore.user || userData;
    if (currentUser) {
      console.log('获取到用户信息，准备更新页面:', currentUser);
      
      // 使用重新赋值的方式确保响应式更新被正确触发
      userProfile.value = {
        username: currentUser.username || '未知用户',
        realName: currentUser.nickname || currentUser.realName || currentUser.username || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '这是一个默认的个人简介',
        avatar: currentUser.avatar || '',
        region: currentUser.region || [],
        website: currentUser.website || '',
        location: currentUser.location || ''
      };
      
      console.log('更新后的userProfile:', userProfile.value);
    } else {
      console.log('未获取到用户信息');
      // 即使没有获取到用户信息，也设置一些默认值
      userProfile.value = {
        username: '未知用户',
        realName: '未知用户',
        email: '',
        phone: '',
        bio: '这是一个默认的个人简介',
        avatar: '',
        region: [],
        website: '',
        location: ''
      };
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
    ElMessage.error('加载用户信息失败');
  }
};

const loadSecuritySettings = async () => {
  try {
    // 暂时使用模拟数据
    console.log('加载安全设置（使用模拟数据）');
    // 这里可以添加实际的API调用
  } catch (error) {
    console.error('加载安全设置失败:', error);
    ElMessage.error('获取安全设置失败，请稍后重试');
  }
};

const loadPreferences = async () => {
  try {
    // 暂时使用模拟数据
    console.log('加载偏好设置（使用模拟数据）');
    // 这里可以添加实际的API调用
  } catch (error) {
    console.error('加载偏好设置失败:', error);
    ElMessage.error('获取偏好设置失败，请稍后重试');
  }
};

const saveProfile = async () => {
  savingProfile.value = true;
  try {
    // 这里应该是调用API保存用户信息
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟API调用
    
    // 构建保存的数据
    const profileData = {
      userInfo: { ...userProfile },
      security: { ...securitySettings },
      preferences: { ...preferences }
    };
    
    console.log('保存用户配置:', profileData);
    ElMessage.success('个人配置保存成功');
  } catch (error) {
    console.error('保存个人配置失败:', error);
    ElMessage.error('保存个人配置失败');
  } finally {
    savingProfile.value = false;
  }
};

const resetProfile = () => {
  // 重置为加载时的值
  loadUserProfile();
  loadSecuritySettings();
  loadPreferences();
  ElMessage.info('已重置为当前保存的值');
};

const triggerAvatarUpload = () => {
  fileInput.value?.click();
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件');
    return;
  }
  
  // 验证文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB');
    return;
  }
  
  try {
    // 这里应该是调用API上传头像
    // 现在我们使用FileReader来预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      userProfile.value.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
    
    ElMessage.success('头像上传成功');
  } catch (error) {
    console.error('上传头像失败:', error);
    ElMessage.error('上传头像失败');
  } finally {
    // 重置input，允许重复选择同一文件
    event.target.value = '';
  }
};

const changePassword = async () => {
  // 验证表单
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    ElMessage.error('请填写所有密码字段');
    return;
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致');
    return;
  }
  
  // 验证新密码强度
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  if (!passwordRegex.test(passwordForm.newPassword)) {
    ElMessage.error('密码长度至少8位，且必须包含字母和数字');
    return;
  }
  
  changingPassword.value = true;
  try {
    // 这里应该是调用API修改密码
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟API调用
    
    ElMessage.success('密码修改成功');
    showChangePasswordDialog.value = false;
    
    // 重置表单
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    ElMessage.error('修改密码失败');
  } finally {
    changingPassword.value = false;
  }
};

const logoutDevice = async (deviceId) => {
  try {
    await ElMessageBox.confirm(
      '确定要登出该设备吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 这里应该是调用API登出设备
    await new Promise(resolve => setTimeout(resolve, 300)); // 模拟API调用
    
    // 从列表中移除设备
    const index = loginDevices.value.findIndex(device => device.id === deviceId);
    if (index !== -1) {
      loginDevices.value.splice(index, 1);
    }
    
    ElMessage.success('设备已成功登出');
  } catch (error) {
    // 用户取消操作
  }
};
</script>

<style scoped>
.profile-container {
  padding: 20px;
  background-color: var(--background-color);
  min-height: 100vh;
}

.profile-card {
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: var(--text-primary);
}

.profile-info-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  border: 3px solid var(--primary-color);
}

.avatar-upload-btn {
  width: 200px;
}

.profile-form,
.security-form,
.preferences-form {
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.touch-friendly {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.touch-friendly:active {
  transform: scale(0.98);
}

.setting-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 5px;
}

.sort-order-switch {
  margin-left: 10px;
}

.password-tips {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 12px;
  }
  
  .card-header h2 {
    font-size: 18px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
  
  .avatar-upload-btn {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 8px;
  }
  
  .profile-form,
  .security-form,
  .preferences-form {
    label-width: 100px;
  }
  
  .el-tabs__header {
    margin-bottom: 10px;
  }
  
  .user-avatar {
    width: 80px !important;
    height: 80px !important;
    font-size: 32px !important;
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] .profile-container {
  background-color: var(--background-color-dark);
}

[data-theme="dark"] .profile-card {
  background-color: var(--card-background-dark);
  border-color: var(--border-color-dark);
}

[data-theme="dark"] .card-header h2,
[data-theme="dark"] .user-avatar {
  color: var(--text-primary-dark);
}

[data-theme="dark"] .setting-description,
[data-theme="dark"] .password-tips {
  color: var(--text-secondary-dark);
}
</style>