import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';

// 设置存储键名
const STORAGE_KEY = 'app_settings';

// 定义默认设置
const DEFAULT_SETTINGS = {
  app: {
    language: 'zh-CN',
    defaultSort: 'created_at',
    pageSize: 10,
    autoPlay: false
  },
  notifications: {
    enabled: true,
    uploadSuccess: true,
    downloadSuccess: true,
    storageWarning: true,
    errorAlerts: true
  }
};

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 应用设置
    settings: { ...DEFAULT_SETTINGS },
    // 存储信息
    storageInfo: {
      used: 0,
      total: 0,
      available: 0
    },
    // 加载状态
    loading: {
      settings: false,
      storage: false
    }
  }),

  getters: {
    // 获取应用设置
    getAppSettings: (state) => state.settings.app,
    
    // 获取通知设置
    getNotificationSettings: (state) => state.settings.notifications,
    
    // 获取存储使用率
    getStorageUsagePercent: (state) => {
      if (!state.storageInfo.total || state.storageInfo.total === 0) return 0;
      return Math.round((state.storageInfo.used / state.storageInfo.total) * 100);
    },
    
    // 获取存储状态
    getStorageStatus: (state) => {
      const percent = state.getStorageUsagePercent;
      if (percent >= 90) return 'exception';
      if (percent >= 75) return 'warning';
      return 'success';
    }
  },

  actions: {
    // 从本地存储加载设置
    async loadSettingsFromStorage() {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
          this.settings = JSON.parse(savedSettings);
        }
      } catch (error) {
        console.error('从本地存储加载设置失败:', error);
        // 如果加载失败，使用默认设置
        this.settings = { ...DEFAULT_SETTINGS };
      }
    },

    // 保存设置到本地存储
    async saveSettingsToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } catch (error) {
        console.error('保存设置到本地存储失败:', error);
        ElMessage.error('保存设置到本地存储失败');
        throw error;
      }
    },

    // 获取设置
    async getSettings() {
      this.loading.settings = true;
      try {
        // 先尝试从本地存储加载
        await this.loadSettingsFromStorage();
        
        // 然后尝试从API获取最新设置
        // 这里是模拟API调用
        // const response = await api.get('/api/settings');
        // this.settings = { ...this.settings, ...response.data };
        
        return this.settings;
      } catch (error) {
        console.error('获取设置失败:', error);
        // 失败时返回当前设置
        return this.settings;
      } finally {
        this.loading.settings = false;
      }
    },

    // 保存设置
    async saveSettings(newSettings) {
      this.loading.settings = true;
      try {
        // 更新设置
        this.settings = { ...this.settings, ...newSettings };
        
        // 保存到本地存储
        await this.saveSettingsToStorage();
        
        // 发送到API
        // 这里是模拟API调用
        // await api.post('/api/settings', this.settings);
        
        // 发布设置更新事件
        this.$emit('settings-updated', this.settings);
        
        return this.settings;
      } catch (error) {
        console.error('保存设置失败:', error);
        ElMessage.error('保存设置失败');
        throw error;
      } finally {
        this.loading.settings = false;
      }
    },

    // 重置设置
    async resetSettings() {
      try {
        this.settings = { ...DEFAULT_SETTINGS };
        await this.saveSettingsToStorage();
        this.$emit('settings-updated', this.settings);
        ElMessage.success('设置已重置为默认值');
        return this.settings;
      } catch (error) {
        console.error('重置设置失败:', error);
        ElMessage.error('重置设置失败');
        throw error;
      }
    },

    // 获取存储信息
    async fetchStorageInfo() {
      this.loading.storage = true;
      try {
        // 模拟API调用
        // const response = await api.get('/api/storage/info');
        // this.storageInfo = response.data;
        
        // 模拟数据
        this.storageInfo = {
          used: 512 * 1024 * 1024, // 512MB
          total: 1024 * 1024 * 1024, // 1GB
          available: 512 * 1024 * 1024 // 512MB
        };
        
        return this.storageInfo;
      } catch (error) {
        console.error('获取存储信息失败:', error);
        // 设置默认值
        this.storageInfo = {
          used: 0,
          total: 0,
          available: 0
        };
        throw error;
      } finally {
        this.loading.storage = false;
      }
    },

    // 清除缓存
    async clearCache() {
      try {
        // 模拟API调用
        // await api.post('/api/cache/clear');
        
        // 模拟清除缓存后的存储信息更新
        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟
        
        // 更新存储信息
        const currentAvailable = this.storageInfo.available;
        // 假设清除了50MB缓存
        const clearedCache = 50 * 1024 * 1024;
        
        this.storageInfo = {
          ...this.storageInfo,
          used: this.storageInfo.used - clearedCache,
          available: currentAvailable + clearedCache
        };
        
        ElMessage.success('缓存已清除');
        return true;
      } catch (error) {
        console.error('清除缓存失败:', error);
        ElMessage.error('清除缓存失败');
        throw error;
      }
    },

    // 更新单个设置项
    async updateSetting(category, key, value) {
      try {
        if (!this.settings[category]) {
          this.settings[category] = {};
        }
        
        this.settings[category][key] = value;
        await this.saveSettingsToStorage();
        
        // 发布设置更新事件
        this.$emit('setting-updated', { category, key, value });
        
        return true;
      } catch (error) {
        console.error('更新设置项失败:', error);
        ElMessage.error('更新设置失败');
        throw error;
      }
    },

    // 检查存储警告
    checkStorageWarning() {
      const percent = this.getStorageUsagePercent;
      if (percent >= 90 && this.settings.notifications.storageWarning) {
        ElMessage.warning({
          message: `存储空间即将用完！当前使用率: ${percent}%`,
          duration: 5000,
          showClose: true
        });
      }
    },

    // 发送通知
    sendNotification(type, message) {
      // 检查通知是否启用
      if (!this.settings.notifications.enabled) return;
      
      // 检查特定类型的通知是否启用
      switch (type) {
        case 'upload-success':
          if (!this.settings.notifications.uploadSuccess) return;
          ElMessage.success(message || '文件上传成功');
          break;
        case 'download-success':
          if (!this.settings.notifications.downloadSuccess) return;
          ElMessage.success(message || '文件下载成功');
          break;
        case 'error':
          if (!this.settings.notifications.errorAlerts) return;
          ElMessage.error(message || '操作失败');
          break;
        default:
          ElMessage.info(message || '通知');
      }
    }
  }
});