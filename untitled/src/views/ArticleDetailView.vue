<template>
  <div class="article-detail-page">
    <!-- 顶部进度条 -->
    <div class="reading-progress" :style="{ width: readingProgress + '%' }"></div>
    
    <div class="container">
      <div class="article-detail-layout">
        <!-- 左侧文章区域 -->
        <div class="article-main-content">
          <!-- 返回按钮 -->
          <button class="back-button" @click="router.back()" aria-label="返回">
            <el-icon class="back-icon"><ArrowLeft /></el-icon>
          </button>
          
          <!-- 加载状态 -->
          <div v-if="articleStore.loadingDetail || isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载文章...</p>
          </div>

          <!-- 文章详情 -->
          <div v-else-if="articleStore.currentArticle" class="article-detail">
            <!-- 文章头部 -->
            <header class="article-header">
              <h1 class="article-title">{{ articleStore.currentArticle.title || '' }}</h1>
              
              <!-- 作者信息 -->
              <div class="author-info">
                <router-link 
                  :to="`/user/${articleStore.currentArticle.author?.id}`" 
                  class="author-avatar-container"
                >
                  <img
                      :src="articleStore.currentArticle.author?.avatar || '/default-avatar.svg'"
                      alt="作者头像"
                      class="author-avatar"
                      loading="lazy"
                  />
                </router-link>
                <div class="author-details">
                  <router-link 
                    :to="`/user/${articleStore.currentArticle.author?.id}`" 
                    class="author-name"
                    hover-class="hover-link"
                  >
                    {{ articleStore.currentArticle.author?.username || '匿名用户' }}
                  </router-link>
                  <div class="article-meta-info">
                    <time class="publish-date" :datetime="articleStore.currentArticle.createdAt">
                      {{ formatDate(articleStore.currentArticle.createdAt) }}
                    </time>
                    <span class="separator"></span>
                    <span class="reading-time">{{ estimatedReadingTime }} 阅读</span>
                  </div>
                </div>
                
                <!-- 关注按钮 -->
                <button 
                  v-if="authStore.isAuthenticated && !isAuthor"
                  class="follow-button"
                  :class="{ 'followed': isFollowing }"
                  @click="handleFollow"
                  :disabled="isFollowingLoading"
                >
                  {{ isFollowing ? '已关注' : '关注' }}
                </button>
              </div>
              
              <!-- 文章统计 -->
              <div class="article-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  <span>{{ formatNumber(articleStore.currentArticle.viewCount || 0) }}</span>
                </span>
                <span class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>{{ formatNumber(articleStore.currentArticle.commentCount || 0) }}</span>
                </span>
                <span class="stat-item">
                  <el-icon><Thumb /></el-icon>
                  <span>{{ formatNumber(articleStore.currentArticle.likes || articleStore.currentArticle.likeCount || 0) }}</span>
                </span>
              </div>
              
              <!-- 分类和标签 -->
              <div class="article-taxonomies">
                <div class="categories">
                  <router-link 
                    v-if="articleStore.currentArticle.category"
                    :to="`/category/${articleStore.currentArticle.category.id}`"
                    class="category-badge"
                  >
                    {{ articleStore.currentArticle.category.name }}
                  </router-link>
                  <span v-else class="no-category">未分类</span>
                </div>
                <div class="tags">
                  <router-link 
                    v-for="tag in articleStore.currentArticle.tags"
                    :key="tag.id"
                    :to="`/tag/${tag.id}`"
                    class="tag"
                  >
                    {{ tag.name }}
                  </router-link>
                </div>
              </div>
            </header>

            <!-- 文章内容 -->
            <article class="article-content">
              <ArticleContent :content="articleStore.currentArticle?.content" />
            </article>

            <!-- 文章底部信息 -->
            <div class="article-footer">
              <div class="update-info">
                <span>最后更新：{{ formatDate(articleStore.currentArticle.updatedAt) }}</span>
              </div>
            </div>

            <!-- 文章操作工具栏 -->
            <div class="article-actions">
              <button
                  class="action-button"
                  :class="{ 'active': isLiked }"
                  @click="handleLike"
                  :disabled="isLiking"
                >
                  <el-icon><Thumb /></el-icon>
                  <span>{{ isLiked ? '已点赞' : '点赞' }}</span>
                </button>
                <button
                  class="action-button"
                  :class="{ 'active': isFavorited }"
                  @click="() => { alert('收藏按钮被点击！'); console.log('收藏按钮被点击，时间戳:', Date.now()); handleFavorite(); }"
                  :disabled="isFavoriting"
                >
                  <el-icon><Star /></el-icon>
                  <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
                </button>
                <button
                  class="action-button"
                  @click="handleShare"
                >
                  <el-icon><Share /></el-icon>
                  <span>分享</span>
                </button>
                <button
                  class="action-button"
                  @click="handleReport"
                >
                  <el-icon><WarningFilled /></el-icon>
                  <span>举报</span>
                </button>
                
                <!-- 作者操作 -->
                <div class="author-actions" v-if="isAuthor">
                  <router-link
                      :to="`/articles/edit?id=${articleStore.currentArticle.id}`"
                      class="edit-button"
                    >
                      <el-icon><Edit /></el-icon>
                      <span>编辑</span>
                    </router-link>
                  <button
                    class="delete-button"
                    @click="handleDelete"
                    :disabled="articleStore.deleting"
                  >
                    <el-icon><Delete /></el-icon>
                    <span>删除</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 文章导航 -->
            <div class="article-navigation">
              <router-link 
                v-if="prevArticle" 
                :to="`/article/${prevArticle.id}`" 
                class="nav-item prev"
              >
                <div class="nav-icon"><ArrowLeft /></div>
                <div class="nav-content">
                  <div class="nav-label">上一篇</div>
                  <div class="nav-title">{{ prevArticle.title }}</div>
                </div>
              </router-link>
              
              <router-link 
                v-if="nextArticle" 
                :to="`/article/${nextArticle.id}`" 
                class="nav-item next"
              >
                <div class="nav-content">
                  <div class="nav-label">下一篇</div>
                  <div class="nav-title">{{ nextArticle.title }}</div>
                </div>
                <div class="nav-icon"><ArrowRight /></div>
              </router-link>
            </div>

            <!-- 评论区 -->
            <div class="comments-section">
              <h3 class="comments-title">
                <el-icon><ChatDotRound /></el-icon>
                <span>评论 ({{ articleStore.currentArticle.commentCount || 0 }})</span>
              </h3>
              <ArticleComments
                :articleId="articleStore.currentArticle.id"
                :isAuthenticated="authStore.isAuthenticated"
                :user="authStore.user"
              />
            </div>
          </div>

          <!-- 文章不存在 -->
          <div v-else class="article-not-found">
            <div class="not-found-icon">
              <el-icon><DocumentDelete /></el-icon>
            </div>
            <h3>文章不存在或已被删除</h3>
            <p>抱歉，您访问的文章可能已被删除或移动到其他位置</p>
            <router-link to="/" class="btn-back-home">
              <el-button type="primary">返回首页</el-button>
            </router-link>
          </div>
        </div>

        <!-- 右侧边栏 -->
        <aside class="article-sidebar">
          <ArticleSidebar
            :author="articleStore.currentArticle?.author"
            :relatedArticles="relatedArticles"
            :loadingRelated="loadingRelatedArticles"
            :recommendArticles="articleStore.recommendArticles"
          />
        </aside>
      </div>
    </div>
    
    <!-- 分享对话框 -->
    <el-dialog v-model="showShareDialog" title="分享文章" width="360px" center>
      <div class="share-dialog-content">
        <div class="share-url">
          <input 
            type="text" 
            :value="shareUrl" 
            readonly 
            class="share-input"
          />
          <el-button @click="copyShareUrl" type="primary" size="small">复制链接</el-button>
        </div>
        <div class="share-platforms">
          <button class="share-platform" v-for="platform in sharePlatforms" :key="platform.id" @click="shareToPlatform(platform)">
            <el-icon :size="24">{{ platform.icon }}</el-icon>
            <span>{{ platform.name }}</span>
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/store/modules/article'
import { useAuthStore } from '@/store/modules/auth'
import { useSocialStore } from '@/store/modules/social'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, ArrowRight, View, ChatDotRound, Thumb, Star, Share, 
  WarningFilled, Edit, Delete, DocumentDelete 
} from '@element-plus/icons-vue'
// 导入组件
import ArticleContent from '@/components/article/ArticleContent.vue'
import ArticleComments from '@/components/article/ArticleComments.vue'
import ArticleSidebar from '@/components/article/ArticleSidebar.vue'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const authStore = useAuthStore()
const socialStore = useSocialStore()

// 响应式数据
const isLiked = computed(() => socialStore.isArticleLiked(route.params.id))
const isFavorited = computed(() => socialStore.isArticleFavorited(route.params.id))
const isLiking = computed(() => socialStore.loading.like)
const isFavoriting = computed(() => socialStore.loading.favorite)
const isFollowingLoading = ref(false)
const isFollowing = ref(false)
const readingProgress = ref(0)
const showShareDialog = ref(false)

// 相关文章
const relatedArticles = ref([])
const loadingRelatedArticles = ref(false)

// 上一篇/下一篇文章
const prevArticle = ref(null)
const nextArticle = ref(null)

// 分享相关
const sharePlatforms = ref([
  { id: 'wechat', name: '微信', icon: 'Wechat' },
  { id: 'weibo', name: '微博', icon: 'Weibo' },
  { id: 'copy', name: '复制链接', icon: 'DocumentCopy' }
])
const shareUrl = computed(() => {
  return `${window.location.origin}/article/${route.params.id}`
})

// 判断是否是文章作者
const isAuthor = computed(() => {
  if (!articleStore.currentArticle || !authStore.isAuthenticated) {
    return false
  }
  return authStore.user?.id === articleStore.currentArticle.author?.id
})

// 估算阅读时间（基于中文文章，假设平均阅读速度为每分钟300字）
const estimatedReadingTime = computed(() => {
  const content = articleStore.currentArticle?.content || ''
  // 移除HTML标签，计算纯文本长度
  const text = content.replace(/<[^>]*>/g, '')
  const wordCount = text.length
  // 四舍五入到最近的整数分钟
  return Math.max(1, Math.round(wordCount / 300))
})

/**
 * 格式化日期
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 格式化数字（1000 -> 1k）
 */
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

/**
 * 文章点赞
 */
const handleLike = async () => {
  // 检查是否登录
  if (!authStore.isAuthenticated) {
    toLogin()
    return
  }
  
  const newStatus = !isLiked.value
  try {
    await socialStore.updateLikeStatus(route.params.id, newStatus)
    ElMessage.success(newStatus ? '点赞成功' : '取消点赞成功')
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

/**
 * 文章收藏
 */
const handleFavorite = async () => {
  console.log('🔄 handleFavorite函数开始执行，时间戳:', Date.now())
  
  // 验证函数被调用
  console.log('✅ 函数已被调用，验证点1通过')
  
  // 检查authStore是否存在且可访问
  console.log('🔍 authStore是否存在:', !!authStore)
  console.log('🔍 authStore.isAuthenticated值:', authStore.isAuthenticated)
  
  // 检查是否登录
  if (!authStore.isAuthenticated) {
    console.log('⚠️ 用户未登录，将跳转到登录页')
    toLogin()
    console.log('📱 已调用toLogin()函数')
    return
  }
  
  console.log('✅ 用户已登录，验证点2通过')
  
  // 检查route对象和参数
  console.log('🔍 route对象是否存在:', !!route)
  console.log('🔍 route.params.id值:', route.params.id)
  console.log('🔍 文章ID类型:', typeof route.params.id)
  
  // 检查isFavorited引用
  console.log('🔍 isFavorited引用是否存在:', !!isFavorited)
  console.log('🔍 当前收藏状态:', isFavorited.value)
  
  try {
    // 设置加载状态
    console.log('🔄 设置isFavoriting为true')
    isFavoriting.value = true
    
    if (isFavorited.value) {
      console.log('🔄 准备取消收藏操作')
      console.log('📞 调用socialStore.unfavoriteArticle，文章ID:', route.params.id)
      await socialStore.unfavoriteArticle(route.params.id)
      console.log('✅ 取消收藏操作成功完成')
      ElMessage.success('取消收藏成功')
      console.log('✅ 取消收藏消息已显示')
    } else {
      console.log('🔄 准备收藏操作')
      console.log('📞 调用socialStore.favoriteArticle，文章ID:', route.params.id)
      await socialStore.favoriteArticle(route.params.id)
      console.log('✅ 收藏操作成功完成')
      ElMessage.success('收藏成功')
      console.log('✅ 收藏消息已显示')
    }
  } catch (error) {
    console.error('❌ 收藏操作失败:', error)
    console.error('❌ 错误详情:', JSON.stringify(error, null, 2))
    ElMessage.error('操作失败，请稍后重试')
    console.log('✅ 错误消息已显示')
  } finally {
    console.log('🔄 重置加载状态，设置isFavoriting为false')
    isFavoriting.value = false
    console.log('✅ 函数执行完成，时间戳:', Date.now())
  }
}

/**
 * 显示分享对话框
 */
const handleShare = () => {
  showShareDialog.value = true
}

/**
 * 复制分享链接
 */
const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ElMessage.success('链接已复制到剪贴板')
    // 分享记录（可选）
    try {
      await socialStore.shareArticle(route.params.id, 'copy')
    } catch (e) {
      console.log('分享记录失败:', e)
    }
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请稍后重试')
  }
}

/**
 * 分享到特定平台
 */
const shareToPlatform = async (platform) => {
  try {
    if (platform.id === 'copy') {
      await copyShareUrl()
    } else {
      // 实际项目中需要集成各平台分享API
      ElMessage.info(`${platform.name}分享功能开发中`)
      try {
        await socialStore.shareArticle(route.params.id, platform.id)
      } catch (e) {
        console.log('分享记录失败:', e)
      }
    }
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('分享失败，请稍后重试')
  }
}

/**
 * 关注作者
 */
const handleFollow = async () => {
  if (!authStore.isAuthenticated) {
    toLogin()
    return
  }
  
  isFollowingLoading.value = true
  try {
    const authorId = articleStore.currentArticle.author.id
    if (isFollowing.value) {
      await socialStore.unfollowUser(authorId)
      ElMessage.success('已取消关注')
    } else {
      await socialStore.followUser(authorId)
      ElMessage.success('关注成功')
    }
    isFollowing.value = !isFollowing.value
  } catch (error) {
    console.error('关注操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    isFollowingLoading.value = false
  }
}

/**
 * 举报文章
 */
const handleReport = async () => {
  if (!authStore.isAuthenticated) {
    toLogin()
    return
  }
  
  try {
    await ElMessageBox.prompt(
      '请输入举报原因',
      '举报文章',
      {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputPlaceholder: '请简要描述举报原因',
        inputValidator: (value) => {
          if (!value || value.trim().length < 5) {
            return '举报原因至少需要5个字符'
          }
          return true
        }
      }
    )
    ElMessage.success('举报已提交，我们会尽快处理')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('举报失败:', error)
    }
  }
}

/**
 * 删除文章
 */
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这篇文章吗？删除后无法恢复。',
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )
    await articleStore.deleteArticle(route.params.id)
    ElMessage.success('删除成功')
    router.push('/')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

/**
 * 跳转到登录页
 */
const toLogin = () => {
  const redirect = encodeURIComponent(window.location.pathname)
  router.push(`/login?redirect=${redirect}`)
}

/**
 * 更新阅读进度
 */
const updateReadingProgress = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const progress = Math.min((scrollTop / docHeight) * 100, 100)
  readingProgress.value = progress
}

/**
 * 图片懒加载初始化
 */
const initImageLazyLoad = () => {
  nextTick(() => {
    const handleScroll = () => {
      const images = document.querySelectorAll('img[loading="lazy"]')
      images.forEach(img => {
        const rect = img.getBoundingClientRect()
        if (rect.top < window.innerHeight + 200 && rect.bottom >= -200) {
          img.removeAttribute('loading')
        }
      })
      if (document.querySelectorAll('img[loading="lazy"]').length === 0) {
        window.removeEventListener('scroll', handleScroll)
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  })
}

/**
 * 获取相关文章
 */
const fetchRelatedArticles = async () => {
  loadingRelatedArticles.value = true
  try {
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

/**
 * 获取文章导航（上一篇/下一篇）
 */
const fetchArticleNavigation = async () => {
  try {
    const currentArticle = articleStore.currentArticle
    if (currentArticle && currentArticle.category?.id) {
      const articles = await articleStore.fetchArticleList({
        categoryId: currentArticle.category.id,
        page: 1,
        pageSize: 50,
        sort: 'createdAt',
        order: 'desc'
      })
      
      const index = articles.records.findIndex(article => article.id === currentArticle.id)
      if (index > 0) {
        prevArticle.value = articles.records[index - 1]
      }
      if (index < articles.records.length - 1) {
        nextArticle.value = articles.records[index + 1]
      }
    }
  } catch (error) {
    console.error('获取文章导航失败:', error)
  }
}

/**
 * 检查关注状态
 */
const checkFollowStatus = async () => {
  if (!authStore.isAuthenticated || !articleStore.currentArticle?.author?.id) {
    isFollowing.value = false
    return
  }
  
  try {
    isFollowing.value = await socialStore.checkFollowStatus(articleStore.currentArticle.author.id)
  } catch (error) {
    console.error('检查关注状态失败:', error)
  }
}

/**
 * 获取文章详情
 */
const fetchArticleDetail = async (articleId) => {
  try {
    // 清空旧数据
    articleStore.clearCurrentArticle()
    relatedArticles.value = []
    prevArticle.value = null
    nextArticle.value = null
    readingProgress.value = 0

    // 获取文章详情
    const data = await articleStore.fetchArticleDetail(articleId)
    // 缓存文章数据
    sessionStorage.setItem(`article_${articleId}`, JSON.stringify(data))

    // 并行加载关联数据
    await Promise.all([
      articleStore.fetchRecommendArticles(5),
      fetchRelatedArticles(),
      fetchArticleNavigation(),
      // 登录状态下加载点赞/收藏状态和关注状态
      authStore.isAuthenticated && Promise.all([
        socialStore.fetchArticleLikeStatus(articleId),
        socialStore.fetchArticleFavoriteStatus(articleId),
        checkFollowStatus()
      ])
    ])

    // 初始化图片懒加载
    initImageLazyLoad()
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章失败，请稍后重试')

    // 加载缓存数据（如果有）
    const cachedArticle = sessionStorage.getItem(`article_${articleId}`)
    if (cachedArticle) {
      try {
        const cachedData = JSON.parse(cachedArticle)
        articleStore.setCurrentArticle(cachedData)
      } catch (parseError) {
        console.error('解析缓存文章失败:', parseError)
      }
    }
  }
}

/**
 * 监听路由变化，重新加载文章
 */
const isLoading = ref(false)
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      isLoading.value = true
      await fetchArticleDetail(newId)
      isLoading.value = false
    }
  },
  { immediate: true, deep: true }
)

/**
 * 页面初始化
 */
onMounted(() => {
  authStore.checkLoginStatus()
  window.addEventListener('scroll', updateReadingProgress, { passive: true })
})

/**
 * 组件卸载时清理
 */
onUnmounted(() => {
  window.removeEventListener('scroll', updateReadingProgress)
})
</script>

<style scoped>
/* 全局样式变量 */
:root {
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --text-placeholder: #c0c4cc;
  --border-color: #e4e7ed;
  --border-light: #ebeef5;
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --transition-normal: all 0.3s ease;
  --shadow-base: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 基础布局 */
.article-detail-page {
  background-color: var(--bg-secondary);
  min-height: 100vh;
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.article-detail-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  padding: 40px 0 60px;
}

/* 阅读进度条 */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background-color: var(--primary-color);
  z-index: 1000;
  transition: width 0.2s ease;
}

/* 返回按钮 */
.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-normal);
  z-index: 100;
  backdrop-filter: blur(5px);
}

.back-button:hover {
  background-color: var(--bg-primary);
  transform: translateX(-3px);
  box-shadow: var(--shadow-light);
}

/* 左侧主要内容区域 */
.article-main-content {
  background-color: var(--bg-primary);
  border-radius: 12px;
  padding: 40px;
  box-shadow: var(--shadow-light);
  position: relative;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  min-height: 400px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--text-secondary);
  font-size: 16px;
}

/* 文章头部 */
.article-header {
  margin-bottom: 40px;
}

.article-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin-bottom: 24px;
  word-break: break-word;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.author-avatar-container {
  display: block;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-light);
  transition: transform 0.3s ease;
}

.author-avatar:hover {
  transform: scale(1.05);
}

.author-details {
  flex: 1;
  min-width: 0;
}

.author-name {
  display: inline-block;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  transition: var(--transition-normal);
  text-decoration: none;
}

.author-name:hover {
  color: var(--primary-color);
}

.article-meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.separator {
  display: inline-block;
  width: 1px;
  height: 12px;
  background-color: var(--border-color);
}

.follow-button {
  padding: 6px 16px;
  border: 1px solid var(--primary-color);
  background-color: transparent;
  color: var(--primary-color);
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: var(--transition-normal);
  white-space: nowrap;
}

.follow-button:hover {
  background-color: var(--primary-color);
  color: white;
}

.follow-button.followed {
  background-color: var(--primary-color);
  color: white;
}

.follow-button.followed:hover {
  background-color: transparent;
  color: var(--primary-color);
}

/* 文章统计 */
.article-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-regular);
  transition: color 0.3s ease;
}

.stat-item:hover {
  color: var(--primary-color);
}

/* 分类和标签 */
.article-taxonomies {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.categories {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: #e6f7ff;
  color: var(--primary-color);
  border-radius: 4px;
  font-size: 14px;
  text-decoration: none;
  transition: var(--transition-normal);
}

.category-badge:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

.no-category {
  color: var(--text-placeholder);
  font-size: 14px;
  font-style: italic;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  background-color: var(--bg-secondary);
  color: var(--text-regular);
  border-radius: 12px;
  font-size: 13px;
  text-decoration: none;
  transition: var(--transition-normal);
  border: 1px solid transparent;
}

.tag:hover {
  background-color: transparent;
  color: var(--primary-color);
  border-color: var(--border-color);
  transform: translateY(-1px);
}

/* 文章内容 */
.article-content {
  margin-bottom: 40px;
}

/* 文章底部信息 */
.article-footer {
  padding: 20px 0;
  border-top: 1px solid var(--border-light);
  margin-bottom: 30px;
}

.update-info {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 文章操作工具栏 */
.article-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 16px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background-color: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-regular);
  transition: var(--transition-normal);
}

.action-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: #f0f9ff;
}

.action-button.active {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
  color: white;
}

.action-button.active:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.author-actions {
  display: flex;
  gap: 12px;
}

.edit-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--success-color);
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition-normal);
}

.edit-button:hover {
  background-color: #85ce61;
}

.delete-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: var(--transition-normal);
}

.delete-button:hover {
  background-color: #f78989;
}

/* 文章导航 */
.article-navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 50px;
  gap: 20px;
}

.nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  text-decoration: none;
  transition: var(--transition-normal);
  border: 1px solid transparent;
}

.nav-item:hover {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.nav-item.prev .nav-icon {
  margin-right: 12px;
  color: var(--primary-color);
}

.nav-item.next .nav-icon {
  margin-left: 12px;
  color: var(--primary-color);
}

.nav-content {
  flex: 1;
  min-width: 0;
}

.nav-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.nav-title {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 评论区 */
.comments-section {
  margin-top: 50px;
}

.comments-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 30px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

/* 文章不存在 */
.article-not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found-icon {
  font-size: 64px;
  color: var(--text-placeholder);
  margin-bottom: 20px;
}

.article-not-found h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.article-not-found p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.btn-back-home {
  display: inline-block;
}

/* 右侧边栏 */
.article-sidebar {
  position: sticky;
  top: 80px;
  height: fit-content;
}

/* 分享对话框 */
.share-dialog-content {
  padding: 10px 0;
}

.share-url {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.share-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.share-platforms {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.share-platform {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  cursor: pointer;
  transition: var(--transition-normal);
}

.share-platform:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.share-platform span {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-regular);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .article-detail-layout {
    grid-template-columns: 1fr;
    padding: 30px 0 50px;
    gap: 20px;
  }
  
  .article-main-content {
    padding: 30px;
  }
  
  .article-title {
    font-size: 1.8rem;
  }
  
  .article-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .article-main-content {
    padding: 24px;
  }
  
  .article-title {
    font-size: 1.5rem;
  }
  
  .author-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .article-stats {
    gap: 16px;
  }
  
  .article-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .author-actions {
    width: 100%;
    justify-content: center;
  }
  
  .article-navigation {
    flex-direction: column;
  }
  
  .share-platforms {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .back-button {
    top: 16px;
    left: 16px;
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .article-main-content {
    padding: 20px 16px;
  }
  
  .article-title {
    font-size: 1.3rem;
  }
  
  .article-stats {
    flex-wrap: wrap;
  }
  
  .action-button {
    justify-content: center;
    flex: 1;
    min-width: 0;
  }
  
  .edit-button, .delete-button {
    flex: 1;
    justify-content: center;
  }
}

/* 暗黑主题适配 */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #f5f5f5;
    --text-regular: #dcdfe6;
    --text-secondary: #c0c4cc;
    --border-color: #434343;
    --border-light: #303030;
    --bg-primary: #1f1f1f;
    --bg-secondary: #141414;
    --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .back-button {
    background-color: rgba(31, 31, 31, 0.9);
    border-color: var(--border-color);
  }
  
  .follow-button {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  .action-button:hover {
    background-color: rgba(64, 158, 255, 0.1);
  }
}
</style>