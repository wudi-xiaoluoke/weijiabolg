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
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            {{ getCategoryName(scope.row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布日期" width="150">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="阅读量" width="100" />
        <el-table-column prop="commentCount" label="评论数" width="100" />
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
    // 修复：从pagination对象中获取total值
    total.value = data.pagination?.total || data.total || 0
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败，请稍后重试')
    
    // 出错时使用模拟数据作为降级方案
    articles.value = [
      {
        id: 1,
        title: 'Vue 3 组合式API深度解析',
        category: '前端开发',
        createdAt: '2024-01-15',
        viewCount: 1245,
        commentCount: 42
      },
      {
        id: 2,
        title: 'Element Plus 组件库最佳实践',
        category: '前端框架',
        createdAt: '2024-01-10',
        viewCount: 986,
        commentCount: 35
      },
      {
        id: 3,
        title: 'Vite 构建工具性能优化技巧',
        category: '开发工具',
        createdAt: '2024-01-05',
        viewCount: 763,
        commentCount: 28
      },
      {
        id: 4,
        title: 'TypeScript 高级类型系统详解',
        category: '编程语言',
        createdAt: '2024-01-01',
        viewCount: 1542,
        commentCount: 56
      },
      {
        id: 5,
        title: '前端工程化实践指南',
        category: '工程化',
        createdAt: '2023-12-28',
        viewCount: 1024,
        commentCount: 45
      }
    ]
    total.value = articles.value.length
  } finally {
    loading.value = false
  }
}

// 格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  // 尝试将各种格式的日期字符串转换为Date对象
  const date = new Date(dateString)
  
  // 检查是否为有效日期
  if (isNaN(date.getTime())) return dateString
  
  // 格式化为YYYY-MM-DD
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 获取分类名称
const getCategoryName = (category) => {
  // 处理分类对象的各种可能情况
  if (!category || category === '' || (Array.isArray(category) && category.length === 0)) {
    return '暂无分类'
  }
  
  // 如果是字符串，直接返回
  if (typeof category === 'string') return category
  
  // 如果是对象，尝试获取name字段
  if (typeof category === 'object') {
    const categoryName = category.name || category.title || category.categoryName
    return categoryName || '暂无分类'
  }
  
  // 其他情况返回'暂无分类'
  return '暂无分类'
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
  // 使用location.href代替router.push以强制刷新页面
  location.href = `/article/detail/${id}`
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
  font-size: 15px; /* 增加整体字体大小 */
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
  padding: 16px 20px; /* 增加内边距 */
  text-align: center;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* 增加轻微阴影 */
}

.stat-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 增强悬停阴影 */
  transform: translateY(-2px);
}

.stat-label {
  display: block;
  font-size: 15px; /* 增加标签字体大小 */
  color: #409eff; /* 改为更醒目的颜色 */
  margin-bottom: 6px;
  font-weight: 500;
}

.stat-value {
  display: block;
  font-size: 24px; /* 增大数值字体 */
  font-weight: 700; /* 加粗 */
  color: #303133;
}

.search-input {
  margin-bottom: 20px;
  width: 100%;
  max-width: 500px;
  font-size: 15px; /* 增加搜索框字体大小 */
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

/* 表格样式优化 - 增强可读性 */
.el-table {
  --el-table-header-bg-color: #f0f2f5;
  --el-table-border-color: #dcdfe6;
  font-size: 15px; /* 增加表格字体大小 */
  line-height: 1.8; /* 增加行高 */
}

/* 确保表格内容清晰可见 */
.el-table .cell {
  font-size: 15px;
  padding: 12px 8px; /* 增加单元格内边距 */
  color: #303133; /* 加深文字颜色 */
}

/* 表头样式优化 */
.el-table__header th {
  font-weight: 700;
  background-color: #f0f2f5;
  font-size: 16px;
  color: #303133;
  padding: 14px 8px;
}

/* 表格行样式优化 */
.el-table__row {
  height: auto;
  min-height: 52px;
  transition: all 0.2s ease;
}

/* 增强悬停效果 */
.el-table__row:hover > td {
  background-color: #ecf5ff !important;
}

/* 斑马纹优化 */
.el-table--striped .el-table__row--striped > td {
  background-color: #fafafa;
}

/* 表格边框优化 */
.el-table th,
.el-table td {
  border-bottom: 1px solid #ebeef5;
}

/* 操作按钮样式优化 */
.article-actions {
  display: flex;
  gap: 10px;
  padding: 6px 0;
  width: 100%;
  flex-wrap: nowrap;
}

.article-actions .el-button--small {
  padding: 8px 16px; /* 增大按钮尺寸 */
  font-size: 14px; /* 增加按钮字体大小 */
  border-radius: 6px;
  flex-shrink: 0;
  min-width: 60px; /* 确保按钮有足够宽度 */
}

/* 确保操作列有足够宽度 */
.el-table-column--fixed-right {
  width: 280px !important;
  min-width: 280px !important;
  box-sizing: border-box;
}

/* 搜索框样式优化 */
.search-input .el-input__inner {
  padding: 12px;
  font-size: 15px;
}

/* 分页组件样式优化 */
.el-pagination {
  font-size: 14px;
}

.el-pagination__sizes .el-input__inner {
  font-size: 14px;
}

/* 响应式设计增强 */
@media (max-width: 1024px) {
  .article-list-container {
    padding: 15px;
    font-size: 14px;
  }
  
  .search-input {
    max-width: 100%;
  }
  
  .stat-value {
    font-size: 22px;
  }
  
  .el-table {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .article-list-container {
    padding: 10px;
    font-size: 14px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .pagination-container {
    justify-content: center;
  }
  
  .stat-item {
    padding: 12px 16px;
  }
  
  .stat-label {
    font-size: 14px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  /* 表格在移动设备上的优化 */
  .el-table {
    font-size: 14px;
    overflow-x: auto;
  }
  
  .el-table__header-wrapper, .el-table__body-wrapper {
    overflow-x: auto;
  }
  
  .el-table .cell {
    padding: 10px 6px;
    font-size: 13px;
  }
  
  /* 调整按钮大小 */
  .article-actions .el-button--small {
    padding: 7px 12px;
    font-size: 13px;
    min-width: 50px;
  }
  
  /* 紧凑显示操作列 */
  .el-table-column--fixed-right {
    width: 240px !important;
    min-width: 240px !important;
  }
}

@media (max-width: 480px) {
  .article-list-container {
    padding: 8px;
    font-size: 13px;
  }
  
  .stat-item {
    padding: 10px 12px;
  }
  
  .stat-label {
    font-size: 13px;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  .el-table-column {
    min-width: 70px;
  }
  
  /* 进一步优化操作列在极小屏幕上的显示 */
  .el-table-column--fixed-right {
    width: 220px !important;
    min-width: 220px !important;
  }
  
  .article-actions {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .article-actions .el-button--small {
    margin: 2px 0;
    padding: 6px 10px;
    font-size: 12px;
    min-width: 45px;
  }
  
  .el-table .cell {
    padding: 8px 4px;
    font-size: 12px;
  }
}

/* 确保表格内容在各种屏幕尺寸下都能正常显示 */
.el-table__body {
  transition: all 0.3s ease;
}

/* 确保表格内容颜色对比度足够 */
.el-table .cell {
  color: #303133;
  font-weight: 400;
}

/* 改善标题列的显示 */
.el-table-column[prop="title"] .cell {
  font-weight: 500;
  color: #1e293b;
}
</style>