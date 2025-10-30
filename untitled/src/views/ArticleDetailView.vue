<template>
  <div class="article-detail-container">
    <!-- 加载状态 -->
    <div v-if="articleStore.loadingDetail" class="loading-state">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="articleStore.currentArticle" class="article-detail">
      <!-- 文章头部 -->
      <div class="article-header">
        <h1 class="article-title">{{ articleStore.currentArticle.title }}</h1>
        
        <div class="article-meta">
          <div class="author-info">
            <img 
              :src="articleStore.currentArticle.author?.avatar || '/default-avatar.svg'" 
              alt="作者头像"
              class="author-avatar"
              loading="lazy"
            />
            <div class="author-details">
              <span class="author-name">{{ articleStore.currentArticle.author?.username || '匿名用户' }}</span>
              <span class="publish-date">{{ formatDate(articleStore.currentArticle.createdAt) }}</span>
            </div>
          </div>
          
          <div class="article-stats">
            <span class="stat-item">
              <i class="el-icon-view"></i> {{ articleStore.currentArticle.viewCount || 0 }}
            </span>
            <span class="stat-item">
              <i class="el-icon-chat-dot-round"></i> {{ articleStore.currentArticle.commentCount || 0 }}
            </span>
            <span class="stat-item">
              <i class="el-icon-thumb"></i> {{ articleStore.currentArticle.likeCount || 0 }}
            </span>
          </div>
        </div>
        
        <!-- 文章分类和标签 -->
        <div class="article-categories-tags">
          <div class="categories">
            <span class="label">分类：</span>
            <el-tag v-if="articleStore.currentArticle.category">
              {{ articleStore.currentArticle.category.name }}
            </el-tag>
            <span v-else>未分类</span>
          </div>
          
          <div class="tags">
            <span class="label">标签：</span>
            <el-tag 
              v-for="tag in articleStore.currentArticle.tags" 
              :key="tag.id" 
              size="small" 
              plain
            >
              {{ tag.name }}
            </el-tag>
            <span v-if="!articleStore.currentArticle.tags || articleStore.currentArticle.tags.length === 0">
              无标签
            </span>
          </div>
        </div>
      </div>
      
      <!-- 文章内容 - 使用拆分组件 -->
      <ArticleContent :content="articleStore.currentArticle.content" />
      
      <!-- 文章操作按钮 -->
      <div class="article-actions">
        <el-button 
          :type="isLiked ? 'primary' : 'default'" 
          @click="handleLike"
          icon="el-icon-thumb"
          :loading="isLiking"
        >
          {{ isLiked ? '已点赞' : '点赞' }}
        </el-button>
        
        <el-button 
          type="default" 
          @click="handleFavorite"
          icon="el-icon-star-on"
          :loading="isFavoriting"
          :type="isFavorited ? 'warning' : 'default'"
        >
          {{ isFavorited ? '已收藏' : '收藏' }}
        </el-button>
        
        <el-button 
          type="default" 
          @click="handleShare"
          icon="el-icon-share"
        >
          分享
        </el-button>
        
        <!-- 作者操作 -->
        <div v-if="isAuthor" class="author-actions">
          <router-link 
            :to="`/articles/edit?id=${articleStore.currentArticle.id}`" 
            class="btn-edit"
          >
            <el-button type="primary" icon="el-icon-edit">编辑</el-button>
          </router-link>
          
          <el-button 
            type="danger" 
            icon="el-icon-delete" 
            @click="handleDelete"
            :loading="articleStore.deleting"
          >
            删除
          </el-button>
        </div>
      </div>
      
      <!-- 文章导航 -->
      <div class="article-navigation">
        <div class="nav-prev" v-if="prevArticle">
          <router-link :to="`/article/${prevArticle.id}`" class="nav-link">
            <span class="nav-label">上一篇</span>
            <span class="nav-title">{{ prevArticle.title }}</span>
          </router-link>
        </div>
        
        <div class="nav-next" v-if="nextArticle">
          <router-link :to="`/article/${nextArticle.id}`" class="nav-link">
            <span class="nav-label">下一篇</span>
            <span class="nav-title">{{ nextArticle.title }}</span>
          </router-link>
        </div>
      </div>
      
      <!-- 评论区 - 使用拆分组件 -->
      <ArticleComments 
        :comments="comments"
        :loading="loadingComments"
        :isAuthenticated="authStore.isAuthenticated"
        :user="authStore.user"
        @submitComment="handleSubmitComment"
        @commentLike="handleCommentLike"
        @updateCount="updateCommentCount"
      />
    </div>
    
    <!-- 文章不存在 -->
    <div v-else class="article-not-found">
      <el-empty description="文章不存在或已被删除" />
      <router-link to="/" class="btn-back-home">
        <el-button type="primary">返回首页</el-button>
      </router-link>
    </div>
    
    <!-- 侧边栏 - 使用拆分组件 -->
    <ArticleSidebar 
      :author="articleStore.currentArticle?.author"
      :relatedArticles="relatedArticles"
      :loadingRelated="loadingRelatedArticles"
      :recommendArticles="articleStore.recommendArticles"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '../store/modules/article'
import { useAuthStore } from '../store/modules/auth'
import { useSocialStore } from '../store/modules/social'
import { useCommentStore } from '../store/modules/comment'
import { ElMessage, ElMessageBox } from 'element-plus'
// 导入拆分的组件
import ArticleContent from '../components/article/ArticleContent.vue'
import ArticleComments from '../components/article/ArticleComments.vue'
import ArticleSidebar from '../components/article/ArticleSidebar.vue'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const authStore = useAuthStore()
const socialStore = useSocialStore()
const commentStore = useCommentStore()

// 响应式数据
// 使用store中的状态替代本地状态
const isLiked = computed(() => socialStore.isArticleLiked(route.params.id))
const isFavorited = computed(() => socialStore.isArticleFavorited(route.params.id))
const isLiking = computed(() => socialStore.loading.like)
const isFavoriting = computed(() => socialStore.loading.favorite)

// 评论数据
const comments = ref([])
const loadingComments = ref(false)

// 相关文章
const relatedArticles = ref([])
const loadingRelatedArticles = ref(false)

// 上一篇和下一篇文章（先用mock数据）
const prevArticle = ref(null)
const nextArticle = ref(null)

// 判断是否是作者
const isAuthor = computed(() => {
  if (!articleStore.currentArticle || !authStore.isAuthenticated) {
    return false
  }
  return authStore.user?.id === articleStore.currentArticle.author?.id
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 点赞文章
const handleLike = async () => {
  const currentStatus = socialStore.isArticleLiked(route.params.id)
  const newStatus = !currentStatus
  
  try {
    await socialStore.updateLikeStatus(route.params.id, newStatus)
    
    // 更新文章点赞数
    if (articleStore.currentArticle) {
      if (newStatus) {
        articleStore.currentArticle.likes++
        ElMessage.success('点赞成功')
      } else {
        articleStore.currentArticle.likes = Math.max(0, articleStore.currentArticle.likes - 1)
        ElMessage.success('取消点赞成功')
      }
    }
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

// 收藏文章
const handleFavorite = async () => {
  try {
    if (isFavorited.value) {
      await socialStore.unfavoriteArticle(route.params.id)
      ElMessage.success('取消收藏成功')
    } else {
      await socialStore.favoriteArticle(route.params.id)
      ElMessage.success('收藏成功')
    }
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

// 分享文章
const handleShare = async () => {
  try {
    // 复制链接到剪贴板
    const url = `${window.location.origin}/article/${route.params.id}`
    await navigator.clipboard.writeText(url)
    
    // 记录分享行为（即使未登录也可以分享，但只有登录用户会记录分享行为）
    try {
      await socialStore.shareArticle(route.params.id, 'copy')
    } catch (shareError) {
      // 分享记录失败不影响用户体验
      console.log('分享记录失败（可能未登录）:', shareError)
    }
    
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('分享失败，请稍后重试')
  }
}

// 删除文章
const handleDelete = async () => {
  try {
    const confirm = await ElMessageBox.confirm(
      '确定要删除这篇文章吗？删除后无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (confirm) {
      await articleStore.deleteArticle(route.params.id)
      ElMessage.success('文章删除成功')
      // 跳转到首页
      router.push('/')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// 提交评论
const handleSubmitComment = async (content) => {
  if (!authStore.isAuthenticated) {
    toLogin()
    throw new Error('请先登录')
  }
  
  try {
    // 调用真实API发表评论
    const newComment = await commentStore.addComment({
      articleId: route.params.id,
      content
    })
    
    // 添加新评论到列表开头
    comments.value.unshift({
      ...newComment,
      user: authStore.user,
      replies: [],
      likeCount: 0
    })
    
    // 更新评论数
    updateCommentCount(comments.value.length)
    
    ElMessage.success('评论发表成功')
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('评论发表失败，请稍后重试')
    throw error
  }
}

// 更新评论数
const updateCommentCount = (newCount) => {
  if (articleStore.currentArticle) {
    articleStore.currentArticle.commentCount = newCount
  }
}

// 点赞评论
const handleCommentLike = async (data) => {
  if (data.type === 'login' || !authStore.isAuthenticated) {
    toLogin()
    return
  }
  
  try {
    // 调用真实API点赞评论
    const newStatus = await socialStore.toggleCommentLike(data.id)
    
    // 查找对应的评论或回复并更新点赞数
    const updateLikeCount = (items, id) => {
      for (const item of items) {
        if (item.id === id) {
          item.likeCount = (item.likeCount || 0) + (newStatus ? 1 : -1)
          return true
        }
        if (item.replies) {
          if (updateLikeCount(item.replies, id)) return true
        }
      }
      return false
    }
    
    updateLikeCount(comments.value, data.id)
  } catch (error) {
    console.error('评论点赞失败:', error)
    ElMessage.error('点赞失败，请稍后重试')
    throw error
  }
}

// 跳转到登录页
const toLogin = () => {
  const currentPath = encodeURIComponent(window.location.pathname)
  router.push(`/login?redirect=${currentPath}`)
}

// 图片懒加载初始化
const initImageLazyLoad = () => {
  nextTick(() => {
    // 监听滚动事件，处理可视区域内的图片加载
    const handleScroll = () => {
      const images = document.querySelectorAll('img[loading="lazy"]')
      images.forEach(img => {
        const rect = img.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          // 图片进入可视区域
          img.removeAttribute('loading')
        }
      })
      
      // 如果所有图片都已加载，移除事件监听
      if (document.querySelectorAll('img[loading="lazy"]').length === 0) {
        window.removeEventListener('scroll', handleScroll)
      }
    }
    
    // 初始检查
    handleScroll()
    // 添加滚动监听
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // 组件卸载时清理
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  })
}

// 获取文章评论
const fetchComments = async () => {
  loadingComments.value = true
  try {
    const data = await commentStore.fetchComments({
      articleId: route.params.id,
      page: 1,
      pageSize: 20
    })
    comments.value = data.records || []
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    loadingComments.value = false
  }
}

// 获取相关文章
const fetchRelatedArticles = async () => {
  loadingRelatedArticles.value = true
  try {
    // 这里假设API支持根据当前文章ID获取相关文章
    // 如果没有专门的API，可以使用文章分类或标签来获取相关文章
    const currentArticle = articleStore.currentArticle
    if (currentArticle && currentArticle.category?.id) {
      const categoryArticles = await articleStore.fetchArticleList({
        categoryId: currentArticle.category.id,
        page: 1,
        pageSize: 5
      })
      relatedArticles.value = categoryArticles.records
        .filter(article => article.id !== currentArticle.id)
        .slice(0, 3)
    }
  } catch (error) {
    console.error('获取相关文章失败:', error)
  } finally {
    loadingRelatedArticles.value = false
  }
}

// 获取文章详情
const fetchArticleDetail = async () => {
  try {
    // 使用请求缓存优化
    const cachedArticle = sessionStorage.getItem(`article_${route.params.id}`)
    if (cachedArticle && !articleStore.loadingDetail) {
      articleStore.currentArticle = JSON.parse(cachedArticle)
      // 异步更新数据
      setTimeout(() => {
        articleStore.fetchArticleDetail(route.params.id).then(data => {
          sessionStorage.setItem(`article_${route.params.id}`, JSON.stringify(data))
        })
      }, 1000)
    } else {
      const data = await articleStore.fetchArticleDetail(route.params.id)
      sessionStorage.setItem(`article_${route.params.id}`, JSON.stringify(data))
    }
    
    // 并发获取推荐文章、相关文章、评论和社交状态
    await Promise.all([
      articleStore.fetchRecommendArticles(5),
      fetchRelatedArticles(),
      fetchComments(),
      // 如果用户已登录，获取文章点赞和收藏状态
      authStore.isAuthenticated && Promise.all([
        socialStore.fetchArticleLikeStatus(route.params.id),
        socialStore.fetchArticleFavoriteStatus(route.params.id)
      ])
    ])
    
    // 初始化图片懒加载
    initImageLazyLoad()
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章失败，请稍后重试')
  }
}

// 使用防抖优化路由变化处理
let fetchTimer = null
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      if (fetchTimer) clearTimeout(fetchTimer)
      fetchTimer = setTimeout(() => {
        fetchArticleDetail()
      }, 100)
    }
  },
  { immediate: true }
)

// 页面加载时检查登录状态
onMounted(() => {
  authStore.checkLoginStatus()
})
</script>

<style scoped>
.article-detail-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.article-detail {
  background-color: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.article-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.article-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 20px;
  line-height: 1.3;
  word-break: break-word;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.author-avatar:hover {
  transform: scale(1.05);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 600;
  color: #303133;
}

.publish-date {
  font-size: 14px;
  color: #909399;
}

.article-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #909399;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.3s ease;
}

.stat-item:hover {
  color: #1890ff;
}

.article-categories-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
}

.categories,
.tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.label {
  color: #909399;
}

.article-actions {
  display: flex;
  gap: 12px;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 32px;
}

.author-actions {
  margin-left: auto;
  display: flex;
  gap: 12px;
}

.article-navigation {
  display: flex;
  justify-content: space-between;
  padding: 24px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 32px;
}

.nav-link {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  max-width: 45%;
  transition: transform 0.3s ease;
}

.nav-link:hover {
  transform: translateX(8px);
}

.nav-label {
  font-size: 14px;
  color: #909399;
}

.nav-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  transition: color 0.3s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-title:hover {
  color: #1890ff;
}

.nav-prev .nav-link {
  align-items: flex-start;
}

.nav-next .nav-link {
  align-items: flex-end;
}

.article-not-found {
  text-align: center;
  padding: 60px 0;
}

.btn-back-home {
  margin-top: 20px;
  display: inline-block;
}

.loading-state {
  background-color: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 响应式设计优化 */
@media (max-width: 1024px) {
  .article-detail-container {
    grid-template-columns: 1fr 250px;
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .article-detail-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .article-stats {
    align-self: flex-start;
  }
}

@media (max-width: 768px) {
  .article-detail-container {
    padding: 16px 0;
  }
  
  .article-detail {
    padding: 20px;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .article-actions {
    flex-wrap: wrap;
  }
  
  .author-actions {
    margin-left: 0;
    width: 100%;
    margin-top: 12px;
  }
  
  .article-navigation {
    flex-direction: column;
    gap: 20px;
  }
  
  .nav-link {
    max-width: 100%;
  }
  
  .article-categories-tags {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .article-detail {
    padding: 16px;
  }
  
  .article-title {
    font-size: 20px;
  }
  
  .article-stats {
    gap: 12px;
  }
}

/* 暗黑模式支持 */
:global(.dark-theme) .article-detail,
:global(.dark-theme) .sidebar-section,
:global(.dark-theme) .loading-state {
  background-color: #1f1f1f;
  color: #e0e0e0;
}

:global(.dark-theme) .article-title,
:global(.dark-theme) .author-name,
:global(.dark-theme) .nav-title {
  color: #e0e0e0;
}

:global(.dark-theme) .article-header,
:global(.dark-theme) .article-actions,
:global(.dark-theme) .article-navigation {
  border-color: #333;
}
</style>