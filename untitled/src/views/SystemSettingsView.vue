<template>
  <div class="settings-container">
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <h2>系统设置</h2>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 应用设置 -->
        <el-tab-pane label="应用设置" name="app">
          <el-form ref="appSettingsForm" :model="appSettings" label-width="120px" class="settings-form touch-friendly">
            <el-form-item label="应用语言">
              <el-select v-model="appSettings.language" placeholder="选择语言" size="large" class="touch-friendly">
                <el-option label="简体中文" value="zh-CN"></el-option>
                <el-option label="English" value="en-US"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="默认排序">
              <el-select v-model="appSettings.defaultSort" placeholder="选择默认排序" size="large" class="touch-friendly">
                <el-option label="按创建时间" value="created_at"></el-option>
                <el-option label="按名称" value="name"></el-option>
                <el-option label="按大小" value="size"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="每页显示">
              <el-input-number v-model="appSettings.pageSize" :min="5" :max="100" :step="5" size="large" class="touch-friendly"/>
            </el-form-item>
            
            <el-form-item label="自动播放">
              <el-switch v-model="appSettings.autoPlay" size="large" class="touch-friendly"/>
            </el-form-item>
            
            <el-form-item label="深色模式" class="theme-switch-wrapper">
              <ThemeSwitcher />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notifications">
          <el-form ref="notificationSettingsForm" :model="notificationSettings" label-width="120px" class="settings-form touch-friendly">
            <el-form-item label="启用通知">
              <el-switch v-model="notificationSettings.enabled" size="large" class="touch-friendly"/>
            </el-form-item>
            
            <el-form-item label="文件上传成功">
              <el-switch v-model="notificationSettings.uploadSuccess" :disabled="!notificationSettings.enabled" size="large" class="touch-friendly"/>
            </el-form-item>
            
            <el-form-item label="文件下载成功">
              <el-switch v-model="notificationSettings.downloadSuccess" :disabled="!notificationSettings.enabled" size="large" class="touch-friendly"/>
            </el-form-item>
            
            <el-form-item label="存储空间警告">
              <el-switch v-model="notificationSettings.storageWarning" :disabled="!notificationSettings.enabled" size="large" class="touch-friendly"/>
              <div v-if="notificationSettings.storageWarning" class="setting-description">
                当存储空间使用超过90%时发送警告
              </div>
            </el-form-item>
            
            <el-form-item label="错误提醒">
              <el-switch v-model="notificationSettings.errorAlerts" :disabled="!notificationSettings.enabled" size="large" class="touch-friendly"/>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 存储设置 -->
        <el-tab-pane label="存储设置" name="storage">
          <div class="storage-info">
            <div class="storage-stats">
              <div class="storage-item">
                <span class="storage-label">已用空间:</span>
                <span class="storage-value">{{ formatStorage(settingsStore.storageInfo.used) }}</span>
              </div>
              <div class="storage-item">
                <span class="storage-label">总空间:</span>
                <span class="storage-value">{{ formatStorage(settingsStore.storageInfo.total) }}</span>
              </div>
              <div class="storage-item">
                <span class="storage-label">可用空间:</span>
                <span class="storage-value">{{ formatStorage(settingsStore.storageInfo.available) }}</span>
              </div>
            </div>
            
            <el-progress :percentage="storageUsagePercent" :status="storageStatus" class="storage-progress" />
            
            <el-button 
              type="danger" 
              @click="clearCache" 
              :loading="clearingCache"
              size="large"
              class="clear-cache-btn touch-friendly"
            >
              <el-icon><Delete /></el-icon>
              清除缓存
            </el-button>
          </div>
        </el-tab-pane>
        
        <!-- 关于 -->
        <el-tab-pane label="关于" name="about">
          <div class="about-section">
            <div class="app-logo">
              <el-icon class="logo-icon"><Management /></el-icon>
            </div>
            <h3 class="app-name">文件管理系统</h3>
            <p class="app-version">版本: {{ appVersion }}</p>
            <p class="app-description">
              一个现代化的文件管理系统，支持文件上传、下载、预览和分类管理。
            </p>
            <div class="app-info">
              <div class="info-item">
                <span class="info-label">开发框架:</span>
                <span class="info-value">Vue 3 + Element Plus</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后更新:</span>
                <span class="info-value">{{ lastUpdateDate }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <div class="form-actions">
        <el-button @click="resetSettings" size="large" class="touch-friendly">重置</el-button>
        <el-button type="primary" @click="saveSettings" :loading="savingSettings" size="large" class="touch-friendly">保存设置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';
import { ElMessage } from 'element-plus';
import { Delete, Management } from '@element-plus/icons-vue';
import ThemeSwitcher from '../components/ThemeSwitcher.vue';

// 存储实例
const settingsStore = useSettingsStore();

// 响应式数据
const activeTab = ref('app');
const savingSettings = ref(false);
const clearingCache = ref(false);
const appVersion = '1.0.0';
const lastUpdateDate = '2023-12-01';

// 应用设置
const appSettings = reactive({
  language: 'zh-CN',
  defaultSort: 'created_at',
  pageSize: 10,
  autoPlay: false
});

// 通知设置
const notificationSettings = reactive({
  enabled: true,
  uploadSuccess: true,
  downloadSuccess: true,
  storageWarning: true,
  errorAlerts: true
});

// 计算属性
const storageUsagePercent = computed(() => {
  if (!settingsStore.storageInfo.total || settingsStore.storageInfo.total === 0) return 0;
  return Math.round((settingsStore.storageInfo.used / settingsStore.storageInfo.total) * 100);
});

const storageStatus = computed(() => {
  const percent = storageUsagePercent.value;
  if (percent >= 90) return 'exception';
  if (percent >= 75) return 'warning';
  return 'success';
});

// 生命周期钩子
onMounted(async () => {
  // 加载设置
  await loadSettings();
  // 获取存储信息
  await settingsStore.fetchStorageInfo();
});

// 方法
const loadSettings = async () => {
  try {
    // 从存储中加载设置
    const savedSettings = await settingsStore.getSettings();
    
    // 应用设置
    if (savedSettings.app) {
      Object.assign(appSettings, savedSettings.app);
    }
    
    // 通知设置
    if (savedSettings.notifications) {
      Object.assign(notificationSettings, savedSettings.notifications);
    }
  } catch (error) {
    console.error('加载设置失败:', error);
    ElMessage.error('加载设置失败');
  }
};

const saveSettings = async () => {
  savingSettings.value = true;
  try {
    const settingsToSave = {
      app: { ...appSettings },
      notifications: { ...notificationSettings }
    };
    
    await settingsStore.saveSettings(settingsToSave);
    ElMessage.success('设置保存成功');
  } catch (error) {
    console.error('保存设置失败:', error);
    ElMessage.error('保存设置失败');
  } finally {
    savingSettings.value = false;
  }
};

const resetSettings = () => {
  // 重置为默认值
  Object.assign(appSettings, {
    language: 'zh-CN',
    defaultSort: 'created_at',
    pageSize: 10,
    autoPlay: false
  });
  
  Object.assign(notificationSettings, {
    enabled: true,
    uploadSuccess: true,
    downloadSuccess: true,
    storageWarning: true,
    errorAlerts: true
  });
  
  ElMessage.info('设置已重置为默认值');
};

const clearCache = async () => {
  clearingCache.value = true;
  try {
    await settingsStore.clearCache();
    await settingsStore.fetchStorageInfo(); // 重新获取存储信息
    ElMessage.success('缓存已清除');
  } catch (error) {
    console.error('清除缓存失败:', error);
    ElMessage.error('清除缓存失败');
  } finally {
    clearingCache.value = false;
  }
};

const formatStorage = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.settings-container {
  padding: 20px;
  background-color: var(--background-color);
  min-height: 100vh;
}

.settings-card {
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

.settings-form {
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

.theme-switch-wrapper {
  display: flex;
  align-items: center;
}

/* 存储设置样式 */
.storage-info {
  padding: 10px 0;
}

.storage-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.storage-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.storage-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.storage-value {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
}

.storage-progress {
  margin-bottom: 20px;
}

.clear-cache-btn {
  width: 100%;
}

.setting-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 5px;
}

/* 关于页面样式 */
.about-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
}

.app-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 40px;
  color: white;
}

.app-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: var(--text-primary);
}

.app-version {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: var(--text-secondary);
}

.app-description {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 500px;
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.info-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    padding: 12px;
  }
  
  .card-header h2 {
    font-size: 18px;
  }
  
  .storage-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .info-item {
    flex-direction: column;
    gap: 5px;
    align-items: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .settings-container {
    padding: 8px;
  }
  
  .settings-form {
    label-width: 100px;
  }
  
  .el-tabs__header {
    margin-bottom: 10px;
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] .settings-container {
  background-color: var(--background-color-dark);
}

[data-theme="dark"] .settings-card {
  background-color: var(--card-background-dark);
  border-color: var(--border-color-dark);
}

[data-theme="dark"] .card-header h2,
[data-theme="dark"] .app-name,
[data-theme="dark"] .storage-value,
[data-theme="dark"] .info-value {
  color: var(--text-primary-dark);
}

[data-theme="dark"] .storage-label,
[data-theme="dark"] .setting-description,
[data-theme="dark"] .app-version,
[data-theme="dark"] .app-description,
[data-theme="dark"] .info-label {
  color: var(--text-secondary-dark);
}

[data-theme="dark"] .app-logo {
  background-color: var(--primary-color-dark);
}
</style>