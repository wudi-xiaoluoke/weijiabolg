<template>
  <div class="article-list">
    <!-- 文章列表 -->
    <div v-if="!loading">
      <div v-if="articles.length > 0" class="article-items">
        <div 
          v-for="article in articles" 
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
    <div class="pagination-container" v-if="!loading && pagination.total > 0">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useArticleStore } from '@/stores/articleStore'
import { useSocialStore } from '../store/modules/social'

const props = defineProps({
  categoryId: {
    type: String,
    default: null
  },
  tagId: {
    type: String,
    default: null
  }
})

const articleStore = useArticleStore()
const socialStore = useSocialStore()

// 响应式数据
const loading = ref(false)
const articles = ref([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 监听props变化
watch(
  () => [props.categoryId, props.tagId],
  () => {
    pagination.currentPage = 1
    fetchArticles()
  },
  { deep: true }
)

// 方法
// 获取文章列表
const fetchArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      categoryId: props.categoryId,
      tagId: props.tagId
    }
    
    // 调用正确的方法名
    await articleStore.fetchArticles(params)
    // 直接从store获取处理后的数据和分页信息
    articles.value = articleStore.articles || []
    pagination.total = articleStore.total || 0
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 获取摘要
const getExcerpt = (content) => {
  if (!content) return ''
  // 移除HTML标签
  const plainText = content.replace(/<[^>]*>/g, '')
  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchArticles()
}

const handleCurrentChange = (current) => {
  pagination.currentPage = current
  fetchArticles()
}

// 组件挂载时初始化数据
onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.article-list {
  width: 100%;
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

/* 响应式设计 */
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