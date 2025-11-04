<template>
  <div class="article-list-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="16">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文章标题或内容"
            prefix-icon="el-icon-search"
            clearable
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="filter-actions">
            <el-select v-model="filterSort" placeholder="排序方式" size="large">
              <el-option label="最新发布" value="createdAt:desc" />
              <el-option label="最早发布" value="createdAt:asc" />
              <el-option label="阅读量高" value="viewCount:desc" />
              <el-option label="评论数多" value="commentCount:desc" />
            </el-select>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <!-- 文章列表 -->
    <div class="article-list" v-if="!articleStore.loading">
      <div v-if="articleStore.articles.length > 0" class="article-items">
        <div 
          v-for="article in articleStore.articles" 
          :key="article.id" 
          class="article-item"
        >
          <router-link :to="`/article/${article.id}`" class="article-link">
            <h3 class="article-title">{{ article.title }}</h3>
            
            <div class="article-meta">
              <span class="author">{{ article.author?.username || '匿名用户' }}</span>
              <span class="dot">·</span>
              <span class="date">{{ formatDate(article.createdAt) }}</span>
              <span class="dot">·</span>
              <span class="category">
                <el-tag size="small" v-if="article.category">{{ article.category.name }}</el-tag>
                <span v-else>未分类</span>
              </span>
              <span class="dot">·</span>
              <span class="views"><i class="el-icon-view"></i> {{ article.viewCount || 0 }}</span>
              <span class="dot">·</span>
              <span class="comments"><i class="el-icon-chat-dot-round"></i> {{ article.commentCount || 0 }}</span>
            </div>
            
            <div class="article-actions-list">
              <button 
                class="action-btn like-btn" 
                :class="{ active: socialStore.isArticleLiked(article.id) }"
                @click.stop="handleArticleLike(article.id)"
                title="点赞"
              >
                <i class="el-icon-thumb"></i>
                <span>{{ article.likes || article.likeCount || 0 }}</span>
              </button>
              <button 
                class="action-btn favorite-btn" 
                :class="{ active: socialStore.isArticleFavorited(article.id) }"
                @click.stop="handleArticleFavorite(article.id)"
                title="收藏"
              >
                <i class="el-icon-star-off"></i>
                <span>收藏</span>
              </button>
            </div>
            
            <div class="article-excerpt">{{ article.excerpt || getExcerpt(article.content) }}</div>
            
            <div class="article-tags" v-if="article.tags && article.tags.length > 0">
              <el-tag 
                v-for="tag in article.tags.slice(0, 5)" 
                :key="tag.id" 
                size="small" 
                plain
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </router-link>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <el-empty description="暂无文章" />
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container" v-if="!articleStore.loading && articleStore.pagination.total > 0">
      <el-pagination
        v-model:current-page="articleStore.pagination.currentPage"
        v-model:page-size="articleStore.pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="articleStore.pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 侧边栏 -->
    <div class="sidebar">
      <!-- 热门文章 -->
      <div class="sidebar-section">
        <h3 class="section-title">热门文章</h3>
        <div class="hot-articles">
          <div 
            v-for="(article, index) in articleStore.hotArticles" 
            :key="article.id" 
            class="hot-article-item"
          >
            <span class="rank">{{ index + 1 }}</span>
            <router-link :to="`/article/${article.id}`" class="hot-article-title">
              {{ article.title }}
            </router-link>
          </div>
          <div v-if="articleStore.hotArticles.length === 0" class="empty-hot">
            暂无热门文章
          </div>
        </div>
      </div>
      
      <!-- 分类 -->
      <div class="sidebar-section">
        <h3 class="section-title">文章分类</h3>
        <div class="categories">
          <router-link 
            v-for="category in categories" 
            :key="category.id" 
            :to="`/category/${category.id}`"
            class="category-item"
          >
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">({{ category.articleCount }})</span>
          </router-link>
        </div>
      </div>
      
      <!-- 标签云 -->
      <div class="sidebar-section">
        <h3 class="section-title">标签云</h3>
        <div class="tag-cloud">
          <router-link 
            v-for="tag in tags" 
            :key="tag.id" 
            :to="`/tag/${tag.id}`"
            class="tag-item"
          >
            {{ tag.name }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useArticleStore } from '../store/modules/article'
import { useSocialStore } from '../store/modules/social'
import { useAuthStore } from '../store/modules/auth'

const articleStore = useArticleStore()
const socialStore = useSocialStore()
const authStore = useAuthStore()
const router = useRouter()

// 搜索参数
const searchKeyword = ref('')
const filterSort = ref('createdAt:desc')

// 分类和标签数据（这里先用mock数据，后续会通过API获取）
const categories = ref([
  { id: 1, name: '前端开发', articleCount: 15 },
  { id: 2, name: '后端开发', articleCount: 12 },
  { id: 3, name: '数据库', articleCount: 8 },
  { id: 4, name: '工具教程', articleCount: 5 }
])

const tags = ref([
  { id: 1, name: 'Vue.js' },
  { id: 2, name: 'React' },
  { id: 3, name: 'Node.js' },
  { id: 4, name: 'MySQL' },
  { id: 5, name: 'JavaScript' },
  { id: 6, name: 'TypeScript' },
  { id: 7, name: 'Git' },
  { id: 8, name: 'CSS' },
  { id: 9, name: 'HTML' },
  { id: 10, name: 'Webpack' }
])

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // 如果是今天，显示具体时间
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (today.getTime() === targetDay.getTime()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  
  // 如果是今年，显示月日
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  
  // 其他情况显示完整日期
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取内容摘要
const getExcerpt = (content) => {
  if (!content) return ''
  // 移除HTML标签并截取前150个字符
  const text = content.replace(/<[^>]+>/g, '')
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

// 搜索文章
const handleSearch = () => {
  articleStore.pagination.currentPage = 1
  fetchArticles()
}

// 分页大小变化
const handleSizeChange = (size) => {
  articleStore.pagination.pageSize = size
  fetchArticles()
}

// 当前页变化
const handleCurrentChange = (current) => {
  articleStore.pagination.currentPage = current
  fetchArticles()
}

// 获取文章列表
const fetchArticles = async () => {
  try {
    const { currentPage, pageSize } = articleStore.pagination
    
    // 解析排序参数
    let sortBy = 'createdAt'
    let sortOrder = 'desc'
    if (filterSort.value) {
      const [field, order] = filterSort.value.split(':')
      sortBy = field
      sortOrder = order
    }
    
    await articleStore.fetchArticleList({
      page: currentPage,
      pageSize,
      keyword: searchKeyword.value,
      sortBy,
      sortOrder
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

// 监听搜索关键词变化
watch(searchKeyword, (newKeyword) => {
  if (newKeyword === '') {
    articleStore.pagination.currentPage = 1
    fetchArticles()
  }
})

// 监听排序方式变化
watch(filterSort, () => {
  articleStore.pagination.currentPage = 1
  fetchArticles()
})

// 处理文章点赞
const handleArticleLike = async (articleId) => {
  try {
    const isLiked = socialStore.isArticleLiked(articleId)
    const newStatus = !isLiked
    
    await socialStore.updateLikeStatus(articleId, newStatus)
    ElMessage.success(isLiked ? '取消点赞成功' : '点赞成功')
  } catch (error) {
    console.error('点赞操作失败:', error)
    if (error.code === 'UNAUTHORIZED') {
      toLogin()
    } else if (error.code === 'PERMISSION_DENIED') {
      ElMessage.warning('您没有权限进行点赞操作')
    } else {
      ElMessage.error('操作失败，请稍后重试')
    }
  }
}

// 处理文章收藏
const handleArticleFavorite = async (articleId) => {
  try {
    const isFavorited = socialStore.isArticleFavorited(articleId)
    if (isFavorited) {
      await socialStore.unfavoriteArticle(articleId)
    } else {
      await socialStore.favoriteArticle(articleId)
    }
    ElMessage.success(isFavorited ? '取消收藏成功' : '收藏成功')
  } catch (error) {
    console.error('收藏操作失败:', error)
    if (error.code === 'UNAUTHORIZED') {
      toLogin()
    } else if (error.code === 'PERMISSION_DENIED') {
      ElMessage.warning('您没有权限进行收藏操作')
    } else {
      ElMessage.error('操作失败，请稍后重试')
    }
  }
}

// 跳转到登录页
const toLogin = () => {
  const currentPath = encodeURIComponent(window.location.pathname)
  router.push(`/login?redirect=${currentPath}`)
}

// 页面加载时获取数据
onMounted(async () => {
  // 获取文章列表
  await fetchArticles()
  
  // 获取热门文章
  await articleStore.fetchHotArticles(5)
  
  // 如果用户已登录，预加载文章的社交状态
  if (authStore.isAuthenticated) {
    const articleIds = articleStore.articles.map(article => article.id)
    await socialStore.preloadArticleSocialStatus(articleIds)
  }
})
</script>

<style scoped>
.article-list-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-bar {
  grid-column: 1 / -1;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
}

.article-list {
  min-height: 400px;
}

.article-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.article-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.article-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  line-height: 1.4;
  transition: color 0.3s;
}

.article-title:hover {
  color: #1890ff;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
}

.dot {
  color: #dcdfe6;
}

.article-excerpt {
  color: #606266;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-actions-list {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.article-actions-list .action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background-color: #f5f7fa;
  border: none;
  border-radius: 16px;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-actions-list .action-btn:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.article-actions-list .action-btn.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.article-actions-list .action-btn.active .el-icon-thumb {
  color: #ff4d4f;
}

.article-actions-list .action-btn.active .el-icon-star-off {
  color: #faad14;
}

/* 暗黑模式支持 */
.dark .article-actions-list .action-btn {
  background-color: #1f2937;
  color: #d1d5db;
}

.dark .article-actions-list .action-btn:hover {
  background-color: #374151;
  color: #3b82f6;
}

.dark .article-actions-list .action-btn.active {
  background-color: #374151;
  color: #3b82f6;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-state,
.loading-state {
  padding: 40px 0;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

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

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.hot-articles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-article-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.rank {
  font-size: 14px;
  font-weight: bold;
  color: #1890ff;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.hot-article-title {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  text-decoration: none;
  transition: color 0.3s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hot-article-title:hover {
  color: #1890ff;
}

.empty-hot {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 20px 0;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: #606266;
  text-decoration: none;
  transition: color 0.3s;
  font-size: 14px;
}

.category-item:hover {
  color: #1890ff;
}

.category-count {
  color: #909399;
  font-size: 12px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 4px 12px;
  background-color: #f5f7fa;
  border-radius: 12px;
  color: #606266;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.3s;
}

.tag-item:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .article-list-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: static;
    order: 2;
  }
}

@media (max-width: 768px) {
  .article-item {
    padding: 16px;
  }
  
  .article-title {
    font-size: 18px;
  }
  
  .article-meta {
    flex-wrap: wrap;
  }
}
</style>