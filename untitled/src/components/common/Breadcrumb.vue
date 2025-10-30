<template>
  <div class="breadcrumb-container" v-if="breadcrumbs.length > 0">
    <el-breadcrumb separator="/" :style="breadcrumbStyle">
      <el-breadcrumb-item 
        v-for="(item, index) in breadcrumbs" 
        :key="index" 
        :class="{ 'active-item': true }"
      >
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 计算当前面包屑数据
const breadcrumbs = computed(() => {
  const breadcrumbList = []
  
  // 首页页面不显示面包屑
  if (route.path === '/') {
    return breadcrumbList
  }
  
  // 处理当前路由的面包屑，只显示页面特定标题，不显示首页
  if (route.meta.breadcrumb || route.meta.title) {
    const breadcrumbTitle = route.meta.breadcrumb || route.meta.title
    breadcrumbList.push({
      title: breadcrumbTitle ? breadcrumbTitle.replace(' - 技术博客', '') : route.name,
      path: route.path
    })
  } else if (route.name) {
    // 如果没有meta信息，使用路由名称
    breadcrumbList.push({
      title: route.name.replace(/([A-Z])/g, ' $1').trim(),
      path: route.path
    })
  }
  
  return breadcrumbList
})

// 面包屑样式
const breadcrumbStyle = {
  fontSize: '16px',
  fontWeight: '500'
}
</script>

<style scoped>
.breadcrumb-container {
  margin-bottom: 15px;
  padding: 5px 0;
}

/* 当前活动项样式 - 作为页面标题显示 */
.active-item {
  color: #303133;
  font-weight: 500;
  cursor: default;
}

/* 隐藏分隔符，因为只有一个项目 */
.el-breadcrumb__separator {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .breadcrumb-container {
    margin-bottom: 10px;
    padding: 5px 0;
  }
  
  .el-breadcrumb {
    font-size: 14px;
  }
}
</style>