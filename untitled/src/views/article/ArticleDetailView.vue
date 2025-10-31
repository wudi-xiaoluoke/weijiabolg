<template>
  <div class="article-detail-container">
    <el-page-header :icon="ArrowLeft" :title="article.title || '文章详情'" @back="handleBack" />
    
    <el-card class="article-detail-card" shadow="hover">
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span>作者：{{ article.author }}</span>
          <span>发布日期：{{ article.date }}</span>
          <span>分类：{{ article.category }}</span>
          <span>阅读量：{{ article.views }}</span>
        </div>
      </div>
      
      <div class="article-content" v-html="article.content"></div>
      
      <div class="article-actions">
        <el-button size="small" @click="handleLike" :type="liked ? 'primary' : ''">
          <el-icon><Star /></el-icon>
          点赞 ({{ article.likes }})
        </el-button>
        <el-button size="small" @click="handleFavorite" :type="favorited ? 'success' : ''">
          <el-icon><StarFilled /></el-icon>
          收藏
        </el-button>
        <el-button size="small" @click="handleShare">
          <el-icon><Share /></el-icon>
          分享
        </el-button>
        <el-button size="small" type="primary" @click="editArticle">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </div>
    </el-card>
    
    <!-- 评论区 -->
    <article-comments :article-id="articleId" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Star, StarFilled, Share, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ArticleComments from '../../components/ArticleComments.vue'
import { articleAPI } from '../../api/index.js'

const router = useRouter()
const route = useRoute()
const articleId = parseInt(route.params.id)

// 状态管理
const article = ref({
  id: '',
  title: '',
  author: '',
  date: '',
  category: '',
  views: 0,
  likes: 0,
  content: ''
})
const liked = ref(false)
const favorited = ref(false)

// 从后端获取文章数据
const fetchArticleDetail = async () => {
  try {
    console.log('获取文章详情，文章ID:', articleId);
    const response = await articleAPI.getArticleById(articleId);
    console.log('文章详情获取成功:', response);
    // 根据后端返回的数据结构调整绑定
    article.value = {
      id: response.id || articleId,
      title: response.title || '文章标题',
      author: response.author?.username || response.author || '未知作者',
      date: response.createdAt ? formatDate(response.createdAt) : new Date().toLocaleDateString(),
      category: response.category?.name || response.category || '未分类',
      views: response.viewCount || response.views || 0,
      likes: response.likeCount || response.likes || 0,
      content: response.content || '<p>暂无内容</p>'
    };
  } catch (error) {
    console.error('获取文章详情失败:', error);
    ElMessage.error('获取文章详情失败');
    // 使用备用数据
    article.value = {
      id: articleId,
      title: '文章加载失败',
      author: '未知',
      date: new Date().toLocaleDateString(),
      category: '未分类',
      views: 0,
      likes: 0,
      content: '<p>无法加载文章内容，请稍后重试</p>'
    };
  }
};

// 格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 生命周期钩子
onMounted(() => {
  fetchArticleDetail();
})

// 方法
const handleBack = () => {
  router.back()
}

const handleLike = () => {
  if (liked.value) {
    article.value.likes--
    ElMessage.info('已取消点赞')
  } else {
    article.value.likes++
    ElMessage.success('点赞成功')
  }
  liked.value = !liked.value
}

const handleFavorite = () => {
  if (favorited.value) {
    ElMessage.info('已取消收藏')
  } else {
    ElMessage.success('收藏成功')
  }
  favorited.value = !favorited.value
}

const handleShare = () => {
  ElMessage.success('分享功能开发中')
}

const editArticle = () => {
  router.push(`/article/edit/${articleId}`)
}
</script>

<style scoped>
.article-detail-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  transition: padding 0.3s ease;
}

.article-detail-card {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.article-header {
  border-bottom: 1px solid var(--border-color-base, #ebeef5);
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.article-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  line-height: 1.3;
  transition: font-size 0.3s ease;
}

.article-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  flex-wrap: wrap;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  padding: 20px 0;
  transition: font-size 0.3s ease;
}

.article-content h2 {
  font-size: 22px;
  margin-top: 30px;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-color-light, #e6f7ff);
  transition: font-size 0.3s ease;
}

.article-content h3 {
  font-size: 18px;
  margin-top: 24px;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  transition: font-size 0.3s ease;
}

.article-content p {
  margin-bottom: 16px;
  text-align: justify;
}

.article-content pre {
  background-color: var(--bg-color-light, #f5f7fa);
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin-bottom: 16px;
  border: 1px solid var(--border-color-light, #ebeef5);
  transition: all 0.3s ease;
}

.article-content code {
  background-color: var(--bg-color-light, #f5f7fa);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.article-content ol,
.article-content ul {
  padding-left: 24px;
  margin-bottom: 16px;
}

.article-content li {
  margin-bottom: 8px;
}

.article-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color-base, #ebeef5);
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

/* 响应式设计增强 */
@media (max-width: 1024px) {
  .article-detail-container {
    padding: 15px;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .article-detail-container {
    padding: 12px;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .article-meta {
    gap: 10px;
    font-size: 13px;
  }
  
  .article-content {
    font-size: 15px;
    padding: 16px 0;
  }
  
  .article-content h2 {
    font-size: 20px;
    margin-top: 24px;
  }
  
  .article-content h3 {
    font-size: 17px;
    margin-top: 20px;
  }
  
  .article-content pre {
    padding: 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .article-detail-container {
    padding: 8px;
  }
  
  .article-title {
    font-size: 20px;
  }
  
  .article-header {
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
  
  .article-content {
    font-size: 14px;
    line-height: 1.7;
  }
  
  .article-content h2 {
    font-size: 18px;
  }
  
  .article-content h3 {
    font-size: 16px;
  }
  
  .article-actions {
    gap: 8px;
    padding-top: 16px;
  }
  
  .article-actions .el-button {
    font-size: 13px;
    padding: 6px 12px;
  }
}

/* 确保在暗黑主题下的良好显示 */
:deep(.el-card__body) {
  background-color: var(--bg-color-white, #ffffff);
  transition: background-color 0.3s ease;
}

/* 代码块在移动设备上的优化 */
.article-content pre {
  position: relative;
}

/* 优化按钮的触摸目标大小，提高移动端可用性 */
.el-button {
  min-height: 32px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
}

/* 防止内容溢出 */
.article-content img {
  max-width: 100%;
  height: auto;
}
</style>