<template>
  <div class="article-list-container">
    <Breadcrumb />
    
    <el-card class="article-list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>全部文章</span>
        </div>
      </template>
      
      <!-- 文章统计信息 -->
      <div class="article-stats">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <span class="stat-label">总文章数</span>
              <span class="stat-value">{{ total }}</span>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <span class="stat-label">总阅读量</span>
              <span class="stat-value">{{ totalViews }}</span>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <span class="stat-label">总评论数</span>
              <span class="stat-value">{{ totalComments }}</span>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="stat-item">
              <span class="stat-label">当前显示</span>
              <span class="stat-value">{{ filteredArticles.length }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <el-input
        v-model="searchQuery"
        placeholder="搜索文章标题"
        prefix-icon="el-icon-search"
        class="search-input"
        @keyup.enter="handleSearch"
      />
      
      <el-table :data="filteredArticles" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="300" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="date" label="发布日期" width="150" />
        <el-table-column prop="views" label="阅读量" width="100" />
        <el-table-column prop="comments" label="评论数" width="100" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="article-actions">
              <el-button size="small" @click="viewArticle(scope.row.id)">查看</el-button>
              <el-button size="small" type="primary" @click="editArticle(scope.row.id)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteArticle(scope.row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { articleAPI } from '@/api/index.js'

const router = useRouter()
const route = useRoute()

// 状态管理
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const articles = ref([])
const loading = ref(false)

// 计算过滤后的文章列表
const filteredArticles = computed(() => {
  if (!searchQuery.value) return articles.value
  
  return articles.value.filter(article => 
    article.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 计算统计数据
const totalViews = computed(() => {
  return articles.value.reduce((sum, article) => sum + (article.views || 0), 0)
})

const totalComments = computed(() => {
  return articles.value.reduce((sum, article) => sum + (article.comments || 0), 0)
})

// 生命周期钩子
onMounted(() => {
  fetchArticles()
})

// 从后端获取文章数据
const fetchArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value || undefined
    }
    const response = await articleAPI.getArticles(params)
    
    // 适配后端返回的Result对象格式
    const data = response.data || response
    // 从PageResultVO中获取数据
    articles.value = data.records || data.list || []
    total.value = data.total || 0
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败，请稍后重试')
    
    // 出错时使用模拟数据作为降级方案
    articles.value = [
      {
        id: 1,
        title: 'Vue 3 组合式API深度解析',
        category: '前端开发',
        date: '2024-01-15',
        views: 1245,
        comments: 42
      },
      {
        id: 2,
        title: 'Element Plus 组件库最佳实践',
        category: '前端框架',
        date: '2024-01-10',
        views: 986,
        comments: 35
      },
      {
        id: 3,
        title: 'Vite 构建工具性能优化技巧',
        category: '开发工具',
        date: '2024-01-05',
        views: 763,
        comments: 28
      },
      {
        id: 4,
        title: 'TypeScript 高级类型系统详解',
        category: '编程语言',
        date: '2024-01-01',
        views: 1542,
        comments: 56
      },
      {
        id: 5,
        title: '前端工程化实践指南',
        category: '工程化',
        date: '2023-12-28',
        views: 1024,
        comments: 45
      }
    ]
    total.value = articles.value.length
  } finally {
    loading.value = false
  }
}

// 方法
const handleBack = () => {
  router.back()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchArticles()
}

const createArticle = () => {
  router.push('/article/edit')
}

const viewArticle = (id) => {
  router.push(`/article/detail/${id}`)
}

const editArticle = (id) => {
  router.push(`/article/edit/${id}`)
}

const deleteArticle = (id) => {
  ElMessageBox.confirm(
    '确定要删除这篇文章吗？此操作不可撤销。',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      // 调用API删除文章
      try {
        await articleAPI.deleteArticle(id)
        // 更新本地列表
        articles.value = articles.value.filter(article => article.id !== id)
        total.value = articles.value.length
        ElMessage.success('文章删除成功')
      } catch (error) {
        console.error('删除文章失败:', error)
        ElMessage.error('删除文章失败，请稍后重试')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchArticles()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  fetchArticles()
}
</script>

<style scoped>
.article-list-container {
  padding: 20px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  overflow-x: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.article-stats {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.stat-item {
  background-color: white;
  border-radius: 6px;
  padding: 12px 16px;
  text-align: center;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.stat-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.search-input {
  margin-bottom: 20px;
  width: 100%;
  max-width: 500px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

/* 表格优化 */
.el-table {
  --el-table-header-bg-color: var(--bg-color-light, #fafafa);
  --el-table-border-color: var(--border-color-base, #ebeef5);
}

/* 响应式设计增强 */
@media (max-width: 1024px) {
  .article-list-container {
    padding: 15px;
  }
  
  .search-input {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .article-list-container {
    padding: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .pagination-container {
    justify-content: center;
  }
  
  /* 表格在移动设备上的优化 */
  .el-table {
    font-size: 14px;
    overflow-x: auto;
  }
  
  .el-table__header-wrapper, .el-table__body-wrapper {
    overflow-x: auto;
  }
  
  /* 调整按钮大小 */
  .el-button {
    font-size: 13px;
    padding: 6px 12px;
  }
  
  /* 紧凑显示操作列 */
  .el-table-column--fixed-right {
    width: 260px !important;
    min-width: 260px !important;
  }
  
  /* 调整按钮间距 */
  .article-actions {
    gap: 6px;
  }
  
  /* 缩小按钮尺寸 */
  .article-actions .el-button--small {
    padding: 5px 10px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .article-list-container {
    padding: 8px;
  }
  
  .el-table-column {
    min-width: 80px;
  }
  
  /* 进一步优化操作列在极小屏幕上的显示 */
  .el-table-column--fixed-right {
    width: 240px !important;
    min-width: 240px !important;
  }
  
  .article-actions {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .article-actions .el-button {
    margin: 2px 0;
    padding: 4px 8px;
    font-size: 12px;
  }
}

/* 确保表格内容在各种屏幕尺寸下都能正常显示 */
.el-table__body {
  transition: all 0.3s ease;
}

/* 优化表头样式 */
.el-table__header th {
  font-weight: 600;
  background-color: var(--bg-color-light, #f8f9fa);
}

/* 操作按钮样式 */
  .article-actions {
    display: flex;
    gap: 8px;
    padding: 4px 0;
    width: 100%;
  }

  /* 确保删除按钮显示 */
  .article-actions .el-button--small {
    padding: 6px 12px;
    font-size: 13px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  /* 调整操作列宽度以适应所有三个按钮 */
  .el-table-column--fixed-right {
    width: 280px !important;
    min-width: 280px !important;
    box-sizing: border-box;
  }
</style>