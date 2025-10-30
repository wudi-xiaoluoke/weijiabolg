<template>
  <div class="theme-switcher">
    <el-tooltip content="切换主题" placement="top">
      <el-switch
      v-model="isDarkTheme"
      :active-icon="Moon"
      :inactive-icon="Sunny"
      active-color="#409eff"
      inactive-color="#e6a23c"
      inline-prompt
      @change="handleThemeChange"
    >
        <template #active-text>
          <el-icon><Moon /></el-icon>
        </template>
        <template #inactive-text>
          <el-icon><Sunny /></el-icon>
        </template>
      </el-switch>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Moon, Sunny } from '@element-plus/icons-vue';

// 是否为暗黑主题
const isDarkTheme = ref(false);

// 获取当前主题
const getCurrentTheme = () => {
  return document.documentElement.getAttribute('data-theme') || 'light';
};

// 设置主题
const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  isDarkTheme.value = theme === 'dark';
  
  // 触发主题变化事件，供其他组件监听
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
};

// 处理主题切换
const handleThemeChange = (value) => {
  const newTheme = value ? 'dark' : 'light';
  setTheme(newTheme);
};

// 监听系统主题变化
const setupSystemThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleSystemThemeChange = (e) => {
    // 只有当用户没有手动设置过主题时，才跟随系统主题
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  };
  
  mediaQuery.addEventListener('change', handleSystemThemeChange);
  
  // 清理函数
  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  };
};

// 生命周期钩子
onMounted(() => {
  // 初始化主题状态
  isDarkTheme.value = getCurrentTheme() === 'dark';
  
  // 设置系统主题监听器
  const cleanup = setupSystemThemeListener();
  
  // 组件卸载时清理
  onBeforeUnmount(() => {
    cleanup();
  });
});

// 暴露方法供父组件调用
defineExpose({
  getCurrentTheme,
  setTheme,
  toggleTheme: () => handleThemeChange(!isDarkTheme.value)
});
</script>

<style scoped>
.theme-switcher {
  display: flex;
  align-items: center;
}

/* 自定义切换按钮样式 */
:deep(.el-switch__core) {
  border-radius: 15px;
  transition: background-color var(--transition-base);
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: var(--primary-color);
}

:deep(.el-switch__action) {
  border-radius: 50%;
  transition: transform var(--transition-base);
}

/* 图标样式优化 */
:deep(.el-switch__icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

/* 适配暗黑主题的样式 */
[data-theme="dark"] :deep(.el-switch__core) {
  background-color: var(--border-color-base);
}

[data-theme="dark"] :deep(.el-switch.is-checked .el-switch__core) {
  background-color: var(--primary-color);
}
</style>