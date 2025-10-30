<template>
  <div class="sidebar">
    <!-- 作者信息 -->
    <div v-if="author" class="sidebar-section author-section">
      <div class="author-card">
        <img 
          :src="author.avatar || '/default-avatar.svg'" 
          alt="作者头像"
          class="author-profile-avatar"
        />
        <h4 class="author-profile-name">{{ author.username || '匿名用户' }}</h4>
        <p class="author-bio">{{ author.bio || '暂无简介' }}</p>
        <el-button type="primary" size="small" class="follow-btn">关注</el-button>
      </div>
    </div>
    
    <!-- 相关文章 -->
    <div class="sidebar-section" v-if="relatedArticles && relatedArticles.length > 0">
      <h3 class="section-title">相关文章</h3>
      <div class="related-articles">
        <router-link 
          v-for="article in relatedArticles" 
          :key="article.id" 
          :to="`/article/${article.id}`" 
          class="related-article-item"
        >
          <span class="related-article-title">{{ article.title }}</span>
          <span class="related-article-date">{{ formatDate(article.createdAt) }}</span>
        </router-link>
      </div>
    </div>
    
    <!-- 推荐文章 -->
    <div class="sidebar-section" v-if="recommendArticles && recommendArticles.length > 0">
      <h3 class="section-title">推荐文章</h3>
      <div class="recommend-articles">
        <router-link 
          v-for="article in recommendArticles" 
          :key="article.id" 
          :to="`/article/${article.id}`" 
          class="recommend-article-item"
        >
          <span class="recommend-article-title">{{ article.title }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  author: {
    type: Object,
    default: null
  },
  relatedArticles: {
    type: Array,
    default: () => []
  },
  recommendArticles: {
    type: Array,
    default: () => []
  }
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.sidebar-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.author-section {
  text-align: center;
}

.author-profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
  /* 懒加载样式 */
  transition: opacity 0.3s ease;
}

.author-profile-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.author-bio {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.related-articles,
.recommend-articles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-article-item,
.recommend-article-item {
  text-decoration: none;
  padding: 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.related-article-item:hover,
.recommend-article-item:hover {
  background-color: #f5f7fa;
  transform: translateX(4px);
}

.related-article-title,
.recommend-article-title {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.related-article-item:hover .related-article-title,
.recommend-article-item:hover .recommend-article-title {
  color: #1890ff;
}

.related-article-date {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .sidebar {
    position: static;
    order: 2;
  }
  
  .author-profile-avatar {
    width: 60px;
    height: 60px;
  }
  
  .author-profile-name {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .sidebar-section {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .author-bio {
    -webkit-line-clamp: 3;
  }
}
</style>