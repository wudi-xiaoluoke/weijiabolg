<template>
  <div class="article-detail-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="container">
        <button class="back-btn" @click="handleBack" aria-label="返回">
          <el-icon><ArrowLeft /></el-icon>
        </button>
        <router-link to="/" class="logo">技术博客</router-link>
        <div class="nav-actions">
          <button v-if="authStore.isAuthenticated" class="action-btn" @click="editArticle" aria-label="编辑文章">
            <el-icon><Edit /></el-icon>
          </button>
          <div class="theme-toggle" @click="toggleTheme">
            <el-icon v-if="isDarkTheme"><Sunny /></el-icon>
            <el-icon v-else><Moon /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载动画 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-empty description="文章加载失败" :image-size="120" />
      <p class="error-message">{{ error }}</p>
      <el-button @click="fetchArticleDetail">重试</el-button>
    </div>

    <!-- 文章内容 -->
    <main v-else class="article-content-wrapper">
      <!-- 文章头部 -->
      <header class="article-header">
        <div class="container">
          <!-- 分类标签 -->
          <router-link v-if="article.category" :to="`/category/${article.categoryId}`" class="category-tag">
            {{ article.category }}
          </router-link>
          
          <!-- 文章标题 -->
          <h1 class="article-title">{{ article.title }}</h1>
          
          <!-- 文章元信息 -->
          <div class="article-meta">
            <div class="author-info">
              <div class="author-avatar">
                {{ getAuthorInitial(article.author) }}
              </div>
              <div class="author-details">
                <span class="author-name">{{ article.author }}</span>
                <span class="publish-date">{{ formatDate(article.date) }}</span>
              </div>
            </div>
            
            <div class="article-stats">
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ formatNumber(article.views || 0) }}
              </span>
              <span class="stat-item">
                <el-icon><Message /></el-icon>
                {{ formatNumber(article.commentCount || 0) }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ formatNumber(article.likes || article.likeCount || 0) }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- 文章正文 -->
      <div class="article-body">
        <div class="container">
          <article class="article-content" v-html="article.content"></article>
          
          <!-- 文章标签 -->
          <div v-if="article.tags && article.tags.length > 0" class="article-tags">
            <span class="tags-label">标签：</span>
            <router-link v-for="tag in article.tags" :key="tag.id" :to="`/tag?tagId=${tag.id}`" class="tag">
              {{ tag.name }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- 文章操作区 -->
      <div class="article-actions">
        <div class="container">
          <div class="actions-container">
            <button 
              class="action-btn primary" 
              :class="{ active: liked }"
              @click="handleLike"
              aria-label="点赞文章"
            >
              <el-icon><Star /></el-icon>
              <span>点赞</span>
              <span class="count">{{ formatNumber(article.likes || article.likeCount || 0) }}</span>
            </button>
            
            <button 
              class="action-btn secondary" 
              :class="{ active: favorited }"
              :loading="favoriteLoading"
              @click="handleFavorite"
              aria-label="收藏文章"
            >
              <el-icon><StarFilled /></el-icon>
              <span>{{ favorited ? '已收藏' : '收藏' }}</span>
            </button>
            
            <button 
              class="action-btn secondary" 
              @click="handleShare"
              aria-label="分享文章"
            >
              <el-icon><Share /></el-icon>
              <span>分享</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 作者信息卡片 -->
      <div class="author-card">
        <div class="container">
          <div class="author-avatar-large">
            {{ getAuthorInitial(article.author) }}
          </div>
          <div class="author-card-content">
            <h3 class="author-card-name">{{ article.author }}</h3>
            <p class="author-bio">{{ article.authorBio || '暂无简介' }}</p>
            <button class="follow-btn">关注作者</button>
          </div>
        </div>
      </div>

      <!-- 相关文章 -->
      <div class="related-articles">
        <div class="container">
          <h2 class="section-title">相关推荐</h2>
          <div class="related-articles-grid">
            <div v-for="item in relatedArticles" :key="item.id" class="related-article-item">
              <router-link :to="`/article/detail/${item.id}`" class="related-article-link">
                <h3 class="related-article-title">{{ item.title }}</h3>
                <p class="related-article-meta">
                  <span>{{ item.author }}</span>
                  <span class="dot">·</span>
                  <span>{{ formatDate(item.date) }}</span>
                </p>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <div class="container">
          <h2 class="section-title">文章评论 ({{ article.commentCount || 0 }})</h2>
          <article-comments :article-id="articleId" @comment-added="handleCommentAdded" />
        </div>
      </div>
    </main>

    <!-- 回到顶部按钮 -->
    <button 
      v-show="showBackToTop" 
      class="back-to-top" 
      @click="backToTop"
      aria-label="回到顶部"
    >
      <el-icon><ArrowUp /></el-icon>
    </button>

    <!-- 分享弹窗 -->
    <el-dialog v-model="shareDialogVisible" title="分享文章" width="30%" :close-on-click-modal="true">
      <div class="share-content">
        <h3>{{ article.title }}</h3>
        <div class="share-link">
          <input type="text" readonly :value="window.location.href" ref="shareLinkInput" />
          <el-button @click="copyShareLink" type="primary" size="small">复制</el-button>
        </div>
        <div class="share-platforms">
          <button class="share-platform wechat" title="微信分享">
            <el-icon><ChatRound /></el-icon>
          </button>
          <button class="share-platform weibo" title="微博分享">
            <el-icon><ChatLineRound /></el-icon>
          </button>
          <button class="share-platform qq" title="QQ分享">
            <el-icon><ChatDotRound /></el-icon>
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, ArrowUp, Star, StarFilled, Share, Edit, 
  View, Message, Moon, Sunny, ChatRound, ChatLineRound, ChatDotRound 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ArticleComments from '../../components/ArticleComments.vue'
import { articleAPI } from '../../api/index.js'
import { useSocialStore } from '../../store/modules/social.js'
import { useAuthStore } from '../../store/modules/auth.js'

const router = useRouter()
const route = useRoute()
const articleId = parseInt(route.params.id)

// 状态管理
const loading = ref(true)
const error = ref(null)
const article = ref({
  id: '',
  title: '',
  author: '',
  authorId: '',
  authorBio: '',
  date: '',
  category: '',
  categoryId: '',
  views: 0,
  commentCount: 0,
  likes: 0,
  tags: [],
  content: ''
})
const liked = ref(false)
const showBackToTop = ref(false)
const shareDialogVisible = ref(false)
const shareLinkInput = ref(null)
const relatedArticles = ref([])

// 使用 store
const socialStore = useSocialStore()
const authStore = useAuthStore()

// 计算属性
const favorited = computed(() => socialStore.isArticleFavorited(articleId))
const favoriteLoading = computed(() => socialStore.favoriteLoading)
const isDarkTheme = computed(() => {
  return document.documentElement.getAttribute('data-theme') === 'dark'
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化数字（添加千分位）
const formatNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取作者首字母
const getAuthorInitial = (authorName) => {
  if (!authorName) return '?'
  return authorName.charAt(0).toUpperCase()
}

// 切换主题
const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}

// 从后端获取文章数据
const fetchArticleDetail = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await articleAPI.getArticleById(articleId)
    const articleData = response.data || response
    
    // 填充文章数据
    article.value = {
      id: articleData.id || articleId,
      title: articleData.title || '文章标题',
      author: articleData.author?.username || articleData.author || '未知作者',
      authorId: articleData.author?.id || '',
      authorBio: articleData.author?.bio || '',
      date: articleData.createTime || articleData.createdAt || new Date().toISOString(),
      category: articleData.category?.name || articleData.category || '未分类',
      categoryId: articleData.category?.id || '',
      views: articleData.viewCount || articleData.views || 0,
      commentCount: articleData.commentCount || 0,
      likes: articleData.likes || articleData.likeCount || 0,
      tags: articleData.tags || [],
      content: articleData.content || '<p>暂无内容</p>'
    }
    
    // 更新页面标题
    document.title = `${article.value.title} - 技术博客`
    
    // 加载相关文章
    fetchRelatedArticles()
    
  } catch (err) {
    console.error('获取文章详情失败:', err)
    error.value = '加载文章失败，请稍后重试'
    
    // 使用模拟数据
    article.value = {
      id: articleId,
      title: '模拟文章标题',
      author: '模拟作者',
      authorBio: '这是一位技术爱好者',
      date: new Date().toISOString(),
      category: '前端开发',
      categoryId: 1,
      views: 1234,
      commentCount: 45,
      likes: 89,
      tags: [{ id: 1, name: 'Vue' }, { id: 2, name: '前端' }],
      content: `<h2>Vue 3 新特性介绍</h2>
                <p>Vue 3 是 Vue.js 的最新主要版本，带来了许多新特性和性能改进。</p>
                <h3>Composition API</h3>
                <p>Composition API 提供了更灵活的组件逻辑组织方式，使代码更易于复用和维护。</p>
                <pre><code>import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

function increment() {
  count.value++
}</code></pre>
                <h3>性能改进</h3>
                <p>Vue 3 在运行时性能和包体积方面都有显著改进。</p>`
    }
  } finally {
    loading.value = false
  }
}

// 获取相关文章
const fetchRelatedArticles = async () => {
  try {
    // 模拟相关文章数据
    relatedArticles.value = [
      {
        id: 2,
        title: 'Vue 3 Composition API 最佳实践',
        author: '张三',
        date: '2024-01-14T00:00:00.000Z'
      },
      {
        id: 3,
        title: 'Vue Router 4 新特性详解',
        author: '李四',
        date: '2024-01-13T00:00:00.000Z'
      },
      {
        id: 4,
        title: 'Pinia 状态管理入门教程',
        author: '王五',
        date: '2024-01-12T00:00:00.000Z'
      }
    ]
  } catch (err) {
    console.error('获取相关文章失败:', err)
    relatedArticles.value = []
  }
}

// 获取文章收藏状态
const fetchFavoriteStatus = async () => {
  try {
    if (authStore.isAuthenticated) {
      await socialStore.fetchArticleFavoriteStatus(articleId)
    }
  } catch (err) {
    console.error('获取文章收藏状态失败:', err)
  }
}

// 点赞处理
const handleLike = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }
  
  try {
    if (liked.value) {
      // 取消点赞
      // await articleAPI.unlikeArticle(articleId)
      article.value.likes = Math.max(0, article.value.likes - 1)
      ElMessage.success('已取消点赞')
    } else {
      // 添加点赞
      // await articleAPI.likeArticle(articleId)
      article.value.likes += 1
      ElMessage.success('点赞成功')
    }
    liked.value = !liked.value
  } catch (err) {
    console.error('点赞操作失败:', err)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 收藏处理
const handleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/auth/login')
    return
  }
  
  try {
    if (favorited.value) {
      // 取消收藏
      await socialStore.unfavoriteArticle(articleId)
      ElMessage.success('取消收藏成功')
    } else {
      // 添加收藏
      await socialStore.favoriteArticle(articleId)
      ElMessage.success('收藏成功')
    }
  } catch (err) {
    console.error('收藏操作失败:', err)
    ElMessage.error(err.message || '操作失败，请稍后重试')
  }
}

// 分享处理
const handleShare = () => {
  shareDialogVisible.value = true
  nextTick(() => {
    if (shareLinkInput.value) {
      shareLinkInput.value.select()
    }
  })
}

// 复制分享链接
const copyShareLink = () => {
  if (shareLinkInput.value) {
    shareLinkInput.value.select()
    document.execCommand('copy')
    ElMessage.success('链接已复制')
  }
}

// 评论添加处理
const handleCommentAdded = () => {
  article.value.commentCount += 1
}

// 编辑文章
const editArticle = () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/auth/login')
    return
  }
  
  // 检查是否是作者或管理员
  const isAuthor = authStore.user?.id === article.value.authorId
  const isAdmin = authStore.user?.roles?.includes('admin')
  
  if (!isAuthor && !isAdmin) {
    ElMessageBox.alert('您没有权限编辑这篇文章', '提示', {
      confirmButtonText: '确定'
    })
    return
  }
  
  router.push(`/article/edit/${articleId}`)
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 回到顶部
const backToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 滚动监听
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
  
  // 实现阅读进度条效果
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const scrollPercent = (scrollTop / docHeight) * 100
  
  // 可以添加阅读进度条的DOM操作
}

// 生命周期钩子
onMounted(async () => {
  await fetchArticleDetail()
  fetchFavoriteStatus()
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* 全局变量 */
:root {
  --primary-color: #409eff;
  --primary-light: #ecf5ff;
  --primary-hover: #66b1ff;
  --primary-active: #3a8ee6;
  --text-primary: #303133;
  --text-secondary: #606266;
  --text-tertiary: #909399;
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --bg-tertiary: #f8f9fa;
  --border-color: #dcdfe6;
  --border-light: #ebeef5;
  --shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 4px 20px 0 rgba(0, 0, 0, 0.12);
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
}

/* 基础样式 */
.article-detail-container {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  transition: background-color var(--transition-normal);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* 顶部导航栏 */
.top-nav {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all var(--transition-normal);
}

.top-nav .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.back-btn,
.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.back-btn:hover,
.theme-toggle:hover {
  background-color: var(--bg-secondary);
  color: var(--primary-color);
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.logo:hover {
  color: var(--primary-color);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--primary-color);
}

/* 加载状态 */
.loading-container {
  max-width: 900px;
  margin: var(--spacing-xl) auto;
  padding: var(--spacing-xl);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
}

/* 错误状态 */
.error-container {
  max-width: 900px;
  margin: var(--spacing-xl) auto;
  padding: var(--spacing-xxl);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
  text-align: center;
}

.error-message {
  color: var(--text-secondary);
  margin: var(--spacing-lg) 0;
}

/* 文章头部 */
.article-header {
  background-color: var(--bg-primary);
  padding: var(--spacing-xxl) 0;
  margin-bottom: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.category-tag {
  display: inline-block;
  background-color: var(--primary-light);
  color: var(--primary-color);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: var(--spacing-lg);
  transition: all var(--transition-fast);
}

.category-tag:hover {
  background-color: var(--primary-color);
  color: white;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.3;
  transition: all var(--transition-normal);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  transition: all var(--transition-normal);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 500;
  color: var(--text-primary);
}

.publish-date {
  font-size: 14px;
  color: var(--text-tertiary);
}

.article-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-tertiary);
  font-size: 14px;
  transition: color var(--transition-fast);
}

.stat-item:hover {
  color: var(--primary-color);
}

/* 文章正文 */
.article-body {
  background-color: var(--bg-primary);
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  transition: all var(--transition-normal);
}

/* 文章内容样式 */
.article-content :deep(h2) {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: var(--spacing-xxl);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--primary-light);
  transition: all var(--transition-normal);
}

.article-content :deep(h3) {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  transition: all var(--transition-normal);
}

.article-content :deep(p) {
  margin-bottom: var(--spacing-lg);
  text-align: justify;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius);
  margin: var(--spacing-lg) 0;
  transition: transform var(--transition-normal);
  cursor: zoom-in;
}

.article-content :deep(img:hover) {
  transform: scale(1.02);
}

.article-content :deep(pre) {
  background-color: #f6f8fa;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  transition: all var(--transition-normal);
  position: relative;
}

.article-content :deep(code) {
  background-color: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  transition: all var(--transition-normal);
}

.article-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.article-content :deep(ol),
.article-content :deep(ul) {
  padding-left: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.article-content :deep(li) {
  margin-bottom: var(--spacing-sm);
}

.article-content :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: var(--spacing-md);
  margin: var(--spacing-lg) 0;
  color: var(--text-secondary);
  font-style: italic;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-lg) 0;
}

.article-content :deep(th) {
  background-color: var(--bg-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  font-weight: 600;
  border: 1px solid var(--border-light);
}

.article-content :deep(td) {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-light);
}

.article-content :deep(tr:nth-child(even)) {
  background-color: var(--bg-secondary);
}

/* 文章标签 */
.article-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}

.tags-label {
  color: var(--text-tertiary);
  font-size: 14px;
}

.tag {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.tag:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

/* 文章操作区 */
.article-actions {
  background-color: var(--bg-primary);
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  transition: all var(--transition-normal);
}

.actions-container {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.article-actions .action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  transition: all var(--transition-normal);
  width: auto;
  height: auto;
  min-height: 44px;
}

.action-btn.primary {
  background-color: var(--primary-light);
  color: var(--primary-color);
  border: 1px solid var(--primary-light);
}

.action-btn.primary:hover {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.action-btn.primary.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.action-btn.secondary {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.action-btn.secondary:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
  transform: translateY(-2px);
}

.action-btn.secondary.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
  border-color: var(--primary-light);
}

.count {
  font-weight: 600;
}

/* 作者信息卡片 */
.author-card {
  background-color: var(--bg-primary);
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.author-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.author-card-content {
  flex: 1;
}

.author-card-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.author-bio {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
}

.follow-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.follow-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 相关文章 */
.related-articles {
  background-color: var(--bg-primary);
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  position: relative;
  padding-left: var(--spacing-md);
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.related-articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.related-article-item {
  transition: transform var(--transition-normal);
}

.related-article-item:hover {
  transform: translateY(-5px);
}

.related-article-link {
  text-decoration: none;
  display: block;
}

.related-article-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
  transition: color var(--transition-fast);
}

.related-article-link:hover .related-article-title {
  color: var(--primary-color);
}

.related-article-meta {
  font-size: 14px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.related-article-meta .dot {
  margin: 0 var(--spacing-xs);
}

/* 评论区 */
.comments-section {
  background-color: var(--bg-primary);
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xxl);
  transition: all var(--transition-normal);
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all var(--transition-normal);
  z-index: 99;
}

.back-to-top:hover {
  background-color: var(--primary-hover);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

/* 分享弹窗样式 */
.share-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.share-link {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.share-link input {
  flex: 1;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 14px;
  color: var(--text-secondary);
}

.share-platforms {
  display: flex;
  gap: var(--spacing-lg);
}

.share-platform {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 20px;
  transition: all var(--transition-fast);
}

.share-platform.wechat {
  background-color: #07C160;
  color: white;
}

.share-platform.weibo {
  background-color: #E6162D;
  color: white;
}

.share-platform.qq {
  background-color: #12B7F5;
  color: white;
}

.share-platform:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .container {
    max-width: 100%;
    padding: 0 var(--spacing-lg);
  }
  
  .article-title {
    font-size: 2.25rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
  }
  
  .top-nav .container {
    height: 56px;
  }
  
  .article-header {
    padding: var(--spacing-xl) 0;
  }
  
  .article-title {
    font-size: 1.875rem;
    margin-bottom: var(--spacing-lg);
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .article-stats {
    gap: var(--spacing-lg);
  }
  
  .article-content {
    font-size: 15px;
  }
  
  .article-content :deep(h2) {
    font-size: 1.5rem;
    margin-top: var(--spacing-xl);
  }
  
  .article-content :deep(h3) {
    font-size: 1.25rem;
  }
  
  .actions-container {
    justify-content: center;
  }
  
  .article-actions .action-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 14px;
  }
  
  .author-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .related-articles-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .back-to-top {
    bottom: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
  }
  
  .share-link {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .article-title {
    font-size: 1.625rem;
  }
  
  .article-header,
  .article-body,
  .article-actions,
  .author-card,
  .related-articles,
  .comments-section {
    padding: var(--spacing-lg) 0;
  }
  
  .article-content :deep(h2) {
    font-size: 1.375rem;
  }
  
  .article-content :deep(h3) {
    font-size: 1.125rem;
  }
  
  .actions-container {
    flex-direction: column;
  }
  
  .article-actions .action-btn {
    justify-content: center;
  }
  
  .back-to-top {
    bottom: 16px;
    right: 16px;
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] {
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --text-tertiary: #808080;
  --bg-primary: #1e1e1e;
  --bg-secondary: #121212;
  --bg-tertiary: #252525;
  --border-color: #333333;
  --border-light: #252525;
  --primary-light: rgba(64, 158, 255, 0.15);
}

[data-theme="dark"] .top-nav {
  background-color: rgba(30, 30, 30, 0.95);
  border-bottom-color: var(--border-color);
}

[data-theme="dark"] .article-content :deep(pre),
[data-theme="dark"] .article-content :deep(code) {
  background-color: #2d2d2d;
  color: #e0e0e0;
}

[data-theme="dark"] .author-avatar,
[data-theme="dark"] .author-avatar-large {
  background-color: rgba(64, 158, 255, 0.2);
}

[data-theme="dark"] .tag {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

[data-theme="dark"] .tag:hover {
  background-color: var(--primary-light);
}

[data-theme="dark"] .article-content :deep(tr:nth-child(even)) {
  background-color: var(--bg-tertiary);
}

[data-theme="dark"] .article-content :deep(th) {
  background-color: var(--bg-tertiary);
}

[data-theme="dark"] .article-content :deep(blockquote) {
  border-left-color: var(--primary-hover);
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>