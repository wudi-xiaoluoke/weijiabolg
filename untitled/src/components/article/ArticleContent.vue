<template>
  <div class="article-content" v-html="renderContent(content)"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

// 渲染文章内容
const renderContent = (content) => {
  if (!content) return ''
  
  // 这里可以添加对内容的处理，比如代码高亮、图片处理等
  return content
}
</script>

<style scoped>
.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 32px;
}

.article-content h2 {
  font-size: 24px;
  margin: 24px 0 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.article-content h3 {
  font-size: 20px;
  margin: 20px 0 14px;
}

.article-content p {
  margin-bottom: 16px;
}

.article-content img {
  max-width: 100%;
  margin: 16px 0;
  border-radius: 8px;
  /* 懒加载样式 */
  transition: opacity 0.3s ease;
}

.article-content code {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.article-content pre {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.article-content pre code {
  background-color: transparent;
  padding: 0;
}
</style>