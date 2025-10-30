import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userAPI } from '../api';

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref(null);
  const users = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const token = ref(localStorage.getItem('token') || '');
  const total = ref(0);
  
  // 安全设置
  const securitySettings = ref({
    twoFactorEnabled: false,
    loginNotifications: true
  });
  
  // 偏好设置
  const preferences = ref({
    language: 'zh-CN',
    defaultView: 'list',
    fileSort: 'name',
    sortDescending: false,
    autoSave: true,
    showHiddenFiles: false
  });
  
  // 登录设备列表
  const loginDevices = ref([]);
  
  // 登录历史
  const loginHistory = ref([]);
  
  // 分类加载状态
  const loadingStates = ref({
    userInfo: false,
    security: false,
    preferences: false,
    devices: false,
    history: false
  });
  
  // 计算属性
  const isAuthenticated = computed(() => !!token.value);
  const userInfo = computed(() => currentUser.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);
  const errorMessage = computed(() => error.value);
  const usersList = computed(() => users.value);
  const totalUsers = computed(() => total.value);
  const isAdmin = computed(() => currentUser.value && currentUser.value.role === 'admin');
  
  // 用户显示信息相关计算属性
  const getDisplayName = computed(() => {
    return currentUser.value?.realName || currentUser.value?.username || '用户';
  });
  
  const getUserAvatar = computed(() => {
    return currentUser.value?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
  });
  
  const getUserInitial = computed(() => {
    const name = getDisplayName.value;
    return name ? name.charAt(0).toUpperCase() : 'U';
  });
  
  // 权限相关计算属性
  const hasPermission = computed(() => (permission) => {
    if (isAdmin.value) return true;
    return currentUser.value?.permissions?.includes(permission) || false;
  });
  
  // 设备相关计算属性
  const getCurrentDevice = computed(() => {
    return loginDevices.value.find(device => device.status === 'active') || null;
  });
  
  // 操作
  // 用户登录
  const login = async (credentials) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await userAPI.login(credentials);
      
      // 保存token
      if (result.token) {
        token.value = result.token;
        localStorage.setItem('token', result.token);
      }
      
      // 保存用户信息
      currentUser.value = result.user || result;
      
      return result;
    } catch (err) {
      error.value = err.message || '登录失败';
      console.error('Login failed:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 用户注册
  const register = async (userData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await userAPI.register(userData);
      
      // 注册成功后自动登录
      if (result.token) {
        token.value = result.token;
        localStorage.setItem('token', result.token);
        currentUser.value = result.user || result;
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '注册失败';
      console.error('Register failed:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    if (!token.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const result = await userAPI.getCurrentUser();
      currentUser.value = result;
      return result;
    } catch (err) {
      //  token过期或无效，清除token
      if (err.status === 401) {
        logout();
      }
      error.value = err.message || '获取用户信息失败';
      console.error('Failed to fetch current user:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取用户列表
  const fetchUsers = async (params = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await userAPI.getUsers(params);
      
      if (result.data) {
        users.value = result.data;
        total.value = result.total || result.data.length;
      } else {
        users.value = result;
        total.value = result.length;
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '获取用户列表失败';
      console.error('Failed to fetch users:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取用户详情
  const fetchUserById = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await userAPI.getUserById(id);
      
      // 如果是当前用户，更新currentUser
      if (currentUser.value && currentUser.value.id === id) {
        currentUser.value = result;
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '获取用户详情失败';
      console.error(`Failed to fetch user ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 更新用户信息
  const updateUser = async (id, userData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await userAPI.updateUser(id, userData);
      
      // 如果是当前用户，更新currentUser
      if (currentUser.value && currentUser.value.id === id) {
        currentUser.value = result;
      }
      
      // 更新用户列表中的用户信息
      const index = users.value.findIndex(user => user.id === id);
      if (index !== -1) {
        users.value[index] = result;
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '更新用户信息失败';
      console.error(`Failed to update user ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 更新当前用户信息
  const updateCurrentUser = async (userData) => {
    if (!currentUser.value) {
      throw new Error('用户未登录');
    }
    return updateUser(currentUser.value.id, userData);
  };
  
  // 修改密码
  const changePassword = async (oldPassword, newPassword) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await userAPI.changePassword({ oldPassword, newPassword });
      return result;
    } catch (err) {
      error.value = err.message || '修改密码失败';
      console.error('Change password failed:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 上传头像
  const uploadAvatar = async (file) => {
    loading.value = true;
    error.value = null;
    
    try {
      // 创建FormData
      const formData = new FormData();
      formData.append('avatar', file);
      
      const result = await userAPI.uploadAvatar(formData);
      
      // 更新当前用户头像
      if (currentUser.value) {
        currentUser.value.avatar = result.avatar;
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '上传头像失败';
      console.error('Upload avatar failed:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取安全设置
  const fetchSecuritySettings = async () => {
    loadingStates.value.security = true;
    error.value = null;
    
    try {
      const result = await userAPI.getSecuritySettings();
      securitySettings.value = result;
      return result;
    } catch (err) {
      error.value = err.message || '获取安全设置失败';
      console.error('Failed to fetch security settings:', err);
      throw err;
    } finally {
      loadingStates.value.security = false;
    }
  };
  
  // 更新安全设置
  const updateSecuritySettings = async (settings) => {
    loadingStates.value.security = true;
    error.value = null;
    
    try {
      const result = await userAPI.updateSecuritySettings(settings);
      securitySettings.value = result;
      return result;
    } catch (err) {
      error.value = err.message || '更新安全设置失败';
      console.error('Failed to update security settings:', err);
      throw err;
    } finally {
      loadingStates.value.security = false;
    }
  };
  
  // 获取偏好设置
  const fetchPreferences = async () => {
    loadingStates.value.preferences = true;
    error.value = null;
    
    try {
      const result = await userAPI.getPreferences();
      preferences.value = result;
      return result;
    } catch (err) {
      error.value = err.message || '获取偏好设置失败';
      console.error('Failed to fetch preferences:', err);
      throw err;
    } finally {
      loadingStates.value.preferences = false;
    }
  };
  
  // 更新偏好设置
  const updatePreferences = async (userPreferences) => {
    loadingStates.value.preferences = true;
    error.value = null;
    
    try {
      const result = await userAPI.updatePreferences(userPreferences);
      preferences.value = result;
      return result;
    } catch (err) {
      error.value = err.message || '更新偏好设置失败';
      console.error('Failed to update preferences:', err);
      throw err;
    } finally {
      loadingStates.value.preferences = false;
    }
  };
  
  // 获取登录设备列表
  const fetchLoginDevices = async () => {
    loadingStates.value.devices = true;
    error.value = null;
    
    try {
      const result = await userAPI.getLoginDevices();
      loginDevices.value = result;
      return result;
    } catch (err) {
      error.value = err.message || '获取登录设备列表失败';
      console.error('Failed to fetch login devices:', err);
      throw err;
    } finally {
      loadingStates.value.devices = false;
    }
  };
  
  // 登出其他设备
  const logoutDevice = async (deviceId) => {
    loading.value = true;
    error.value = null;
    
    try {
      await userAPI.logoutDevice(deviceId);
      
      // 从列表中移除设备
      loginDevices.value = loginDevices.value.filter(device => device.id !== deviceId);
      
      return { success: true };
    } catch (err) {
      error.value = err.message || '登出设备失败';
      console.error('Failed to logout device:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取登录历史
  const fetchLoginHistory = async () => {
    loadingStates.value.history = true;
    error.value = null;
    
    try {
      const result = await userAPI.getLoginHistory();
      loginHistory.value = result;
      return result;
    } catch (err) {
      error.value = err.message || '获取登录历史失败';
      console.error('Failed to fetch login history:', err);
      throw err;
    } finally {
      loadingStates.value.history = false;
    }
  };
  
  // 验证权限
  const checkPermission = async (permission) => {
    // 如果未登录，没有任何权限
    if (!isAuthenticated.value) {
      return false;
    }
    
    // 如果是管理员，拥有所有权限
    if (isAdmin.value) {
      return true;
    }
    
    // 检查特定权限
    return currentUser.value?.permissions?.includes(permission) || false;
  };
  
  // 刷新Token
  const refreshToken = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await userAPI.refreshToken();
      
      // 更新Token
      token.value = result.token;
      localStorage.setItem('token', result.token);
      
      return result;
    } catch (err) {
      error.value = err.message || '刷新Token失败';
      console.error('Refresh token failed:', err);
      
      // Token刷新失败，清除用户信息
      logout();
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 用户登出
  const logout = () => {
    // 清除本地存储的token
    localStorage.removeItem('token');
    
    // 重置状态
    token.value = '';
    currentUser.value = null;
    error.value = null;
    
    // 调用API登出
    try {
      userAPI.logout();
    } catch (err) {
      // 忽略登出API的错误
      console.log('Logout API error (ignored):', err);
    }
  };
  
  // 检查token并自动登录
  const checkAuth = async () => {
    if (token.value && !currentUser.value) {
      try {
        await fetchCurrentUser();
        return true;
      } catch (err) {
        return false;
      }
    }
    return !!token.value;
  };
  
  // 清除错误
  const clearError = () => {
    error.value = null;
  };
  
  // 重置状态
  const resetState = () => {
    currentUser.value = null;
    users.value = [];
    loading.value = false;
    error.value = null;
    token.value = '';
    total.value = 0;
  };
  
  return {
    // 状态
    currentUser,
    users,
    loading,
    loadingStates,
    error,
    token,
    total,
    securitySettings,
    preferences,
    loginDevices,
    loginHistory,
    
    // 计算属性
    isAuthenticated,
    userInfo,
    isLoading,
    hasError,
    errorMessage,
    usersList,
    totalUsers,
    isAdmin,
    getDisplayName,
    getUserAvatar,
    getUserInitial,
    hasPermission,
    getCurrentDevice,
    
    // 操作
    login,
    register,
    fetchCurrentUser,
    fetchUsers,
    fetchUserById,
    updateUser,
    updateCurrentUser,
    changePassword,
    uploadAvatar,
    fetchSecuritySettings,
    updateSecuritySettings,
    fetchPreferences,
    updatePreferences,
    fetchLoginDevices,
    logoutDevice,
    fetchLoginHistory,
    checkPermission,
    refreshToken,
    logout,
    checkAuth,
    clearError,
    resetState
  };
});