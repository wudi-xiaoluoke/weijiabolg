<template>
  <div class="article-list-container">
    <!-- 顶部导航栏 -->
    <div class="header-section">
      <div class="header-left">
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>文章管理</el-breadcrumb-item>
          <el-breadcrumb-item>文章列表</el-breadcrumb-item>
        </el-breadcrumb>
        <h1 class="page-title">文章列表</h1>
      </div>
      <el-button 
        type="primary" 
        @click="handleCreateArticle" 
        :icon="Plus"
        class="create-btn"
      >
        新增文章
      </el-button>
    </div>

    <!-- 统计卡片部分 - 使用网格布局 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover" :body-style="{ padding: '20px' }">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper primary">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalArticles }}</div>
            <div class="stat-label">总文章数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover" :body-style="{ padding: '20px' }">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper success">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ publishedArticles }}</div>
            <div class="stat-label">已发布</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover" :body-style="{ padding: '20px' }">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper warning">
            <el-icon><Edit /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ draftArticles }}</div>
            <div class="stat-label">草稿</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover" :body-style="{ padding: '20px' }">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper info">
            <el-icon><View /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalViews }}</div>
            <div class="stat-label">总浏览量</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索筛选区 - 现代化设计 -->
    <div class="filter-section">
      <el-card shadow="never" class="search-card">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="文章标题" class="search-item">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入文章标题"
              clearable
              prefix-icon="Search"
              :maxlength="100"
              class="search-input"
            />
          </el-form-item>
          
          <el-form-item label="文章分类" class="search-item">
            <el-select
              v-model="searchForm.category"
              placeholder="请选择分类"
              clearable
              filterable
              :loading="loadingCategories"
              class="search-select"
            >
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="文章状态" class="search-item">
            <el-select 
              v-model="searchForm.status" 
              placeholder="请选择状态" 
              clearable
              class="search-select"
            >
              <el-option label="已发布" :value="1" />
              <el-option label="草稿" :value="0" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="发布时间" class="search-item">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              class="date-picker"
            />
          </el-form-item>
          
          <el-form-item class="search-item search-actions">
            <el-button 
              type="primary" 
              @click="handleSearch"
              :icon="Search"
              class="search-btn"
            >
              搜索
            </el-button>
            <el-button 
              @click="handleReset"
              :icon="Refresh"
              class="reset-btn"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 文章列表表格 - 增强的视觉设计 -->
    <div class="table-section">
      <div class="table-header">
        <h2 class="table-title">文章数据</h2>
        <div class="table-actions">
          <el-button 
            v-if="selection.length > 0" 
            @click="batchDialogVisible = true"
            :icon="Operation"
            class="batch-btn"
          >
            批量操作 ({{ selection.length }})
          </el-button>
        </div>
      </div>
      
      <el-card shadow="never" class="table-card">
        <div class="table-container" v-loading="loading">
          <el-table
            v-loading="loading"
            :data="paginatedArticles"
            style="width: 100%"
            border
            stripe
            row-key="id"
            @selection-change="handleSelectionChange"
            :header-cell-style="{ 
              'background-color': '#f8fafc', 
              'font-weight': '600',
              'color': '#334155'
            }"
          >
            <el-table-column type="selection" width="55" fixed="left" />
            <el-table-column label="ID" width="80" fixed="left">
              <template #default="{ $index }">
                {{ (pagination.currentPage - 1) * pagination.pageSize + $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column prop="title" label="文章标题" min-width="350" show-overflow-tooltip>
              <template #default="{ row }">
                <router-link 
                  :to="`/article/detail/${row.id}`" 
                  class="title-link"
                  target="_blank"
                >
                  {{ row.title }}
                </router-link>
              </template>
            </el-table-column>
            
            <el-table-column prop="categoryName" label="分类" width="120">
              <template #default="{ row }">
                <el-tag 
                  :type="getCategoryType(row.categoryName)" 
                  size="small"
                  class="category-tag"
                >
                  {{ row.categoryName || '未分类' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="标签" width="200">
              <template #default="{ row }">
                <div class="tags-container">
                  <el-tag
                    v-for="(tag, index) in row.tags.slice(0, 5)"
                    :key="index"
                    size="small"
                    :class="`tag-item tag-${index % 5}`"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-tag 
                    v-if="row.tags.length > 5" 
                    size="small" 
                    plain
                    class="more-tags"
                  >
                    +{{ row.tags.length - 5 }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 1 ? 'success' : 'warning'"
                  size="small"
                  class="status-tag"
                >
                  {{ row.status === 1 ? '已发布' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="viewCount" label="浏览量" width="100" align="center">
              <template #default="{ row }">
                <div class="count-item">
                  <el-icon class="count-icon"><View /></el-icon>
                  {{ row.viewCount || 0 }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="commentCount" label="评论数" width="100" align="center">
              <template #default="{ row }">
                <div class="count-item">
                  <el-icon class="count-icon"><ChatDotRound /></el-icon>
                  {{ row.commentCount || 0 }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="publishTime" label="发布时间" width="180" align="center">
              <template #default="{ row }">
                <div class="date-info">
                  {{ formatDate(row.publishTime) }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column fixed="right" label="操作" width="180" align="center">
              <template #default="{ row }">
                <el-button-group class="action-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleViewArticle(row.id)"
                    :icon="View"
                    class="view-btn"
                  >
                    查看
                  </el-button>
                  <el-button
                    type="success"
                    size="small"
                    @click="handleEditArticle(row.id)"
                    :icon="Edit"
                    class="edit-btn"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleDeleteArticle(row)"
                    :icon="Delete"
                    class="delete-btn"
                  >
                    删除
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态 - 增强的视觉设计 -->
          <div v-if="!loading && paginatedArticles.length === 0" class="empty-state">
            <div class="empty-container">
              <el-empty description="暂无文章数据" :image-size="120" />
              <el-button 
                type="primary" 
                @click="handleCreateArticle" 
                class="empty-action-btn"
                :icon="Plus"
              >
                创建第一篇文章
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页组件 - 居中显示 -->
        <div v-if="paginatedArticles.length > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalArticles"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="pagination"
            :pager-count="5"
          />
        </div>
      </el-card>
    </div>

    <!-- 批量操作对话框 - 现代化设计 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量操作"
      width="500px"
      @close="handleBatchDialogClose"
      class="batch-dialog"
      :custom-class="'modern-dialog'"
    >
      <div class="batch-actions-content">
        <div class="batch-info">
          <p>已选择 <strong>{{ selection.length }}</strong> 篇文章</p>
        </div>
        
        <div class="action-selection">
          <el-radio-group v-model="batchAction" class="action-radio-group">
            <el-radio :label="'delete'" class="action-radio">
              <el-icon class="radio-icon danger"><Delete /></el-icon>
              <span>批量删除</span>
            </el-radio>
            <el-radio :label="'publish'" class="action-radio">
              <el-icon class="radio-icon success"><Check /></el-icon>
              <span>批量发布</span>
            </el-radio>
            <el-radio :label="'draft'" class="action-radio">
              <el-icon class="radio-icon warning"><Edit /></el-icon>
              <span>批量设为草稿</span>
            </el-radio>
            <el-radio :label="'move'" class="action-radio">
              <el-icon class="radio-icon primary"><SwitchButton /></el-icon>
              <span>批量移动到分类</span>
            </el-radio>
          </el-radio-group>
        </div>
        
        <div 
          v-if="batchAction === 'move'" 
          class="category-selection"
        >
          <el-form-item label="目标分类">
            <el-select
              v-model="targetCategory"
              placeholder="请选择目标分类"
              style="width: 100%"
              class="category-select"
            >
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleBatchConfirm" 
            :loading="batchLoading"
            :disabled="batchAction === 'move' && !targetCategory"
          >
            确认操作
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Document,
  Check,
  Edit,
  View,
  Delete,
  ChatDotRound,
  Operation,
  SwitchButton
} from '@element-plus/icons-vue'
import { useArticleStore } from '@/stores/articleStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTagStore } from '@/stores/tagStore'
import { articleAPI } from '@/api'

// 使用store获取数据
const articleStore = useArticleStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

// 响应式数据
const loadingCategories = ref(false)
const searchForm = ref({
  title: '',
  category: '',
  status: '',
  dateRange: null
})
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})
const selection = ref([])
const batchDialogVisible = ref(false)
const batchAction = ref('delete')
const targetCategory = ref('')
const batchLoading = ref(false)

// 路由
const router = useRouter()

// 计算属性
const paginatedArticles = computed(() => {
  return Array.isArray(articleStore.articles) ? articleStore.articles : []
})

const totalArticles = computed(() => {
  return articleStore.total || 0
})

const publishedArticles = computed(() => {
  if (!Array.isArray(articleStore.articles)) {
    return 0
  }
  return articleStore.articles.filter(article => article?.status === 1).length // 1表示已发布
})

const draftArticles = computed(() => {
  if (!Array.isArray(articleStore.articles)) {
    return 0
  }
  return articleStore.articles.filter(article => article?.status === 0).length // 0表示草稿
})

const totalViews = computed(() => {
  if (!Array.isArray(articleStore.articles)) {
    return 0
  }
  return articleStore.articles.reduce((sum, article) => sum + (article?.viewCount || 0), 0)
})

const categories = computed(() => {
  return categoryStore.categories || []
})

const loading = computed(() => {
  return articleStore.loading
})

// 获取分类的标签类型
const getCategoryType = (categoryName) => {
  const typeMap = ['primary', 'success', 'warning', 'info', 'danger']
  if (!categoryName) return 'default'
  return typeMap[categoryName.length % typeMap.length]
}

// 处理表格选择
const handleSelectionChange = (val) => {
  selection.value = val.map(item => item.id)
}

// 初始化数据
const initData = async () => {
  try {
    await Promise.all([
      fetchArticles(),
      fetchCategories(),
      fetchTags()
    ])
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('初始化数据失败')
  }
}

// 获取文章列表
const fetchArticles = async () => {
  try {
    const { currentPage, pageSize } = pagination.value
    const { title, category, status, dateRange } = searchForm.value
    
    const params = {
      page: currentPage,
      pageSize,
      title,
      categoryId: category,
      status,
      sortBy: 'publishTime', // 默认按发布时间排序
      sortOrder: 'desc', // 默认降序，最新的在前面
      ...(dateRange && {
        startTime: dateRange[0],
        endTime: dateRange[1]
      })
    }
    
    await articleStore.fetchArticles(params)
    // 使用articleStore.paginationInfo而不是不存在的articleStore.pagination
    pagination.value = {
      currentPage: articleStore.paginationInfo.currentPage,
      pageSize: articleStore.paginationInfo.pageSize,
      total: articleStore.paginationInfo.total
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  }
}

// 获取分类列表
const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    await categoryStore.fetchCategories()
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loadingCategories.value = false
  }
}

// 获取标签列表
const fetchTags = async () => {
  try {
    await tagStore.fetchTags()
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'  
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 搜索处理
const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchArticles()
}

// 重置处理
const handleReset = () => {
  searchForm.value = {
    title: '',
    category: '',
    status: '',
    dateRange: null
  }
  pagination.value.currentPage = 1
  fetchArticles()
}

// 创建文章
const handleCreateArticle = () => {
  router.push('/article/create')
}

// 查看文章
const handleViewArticle = (id) => {
  router.push(`/article/detail/${id}`)
}

// 编辑文章
const handleEditArticle = (id) => {
  router.push(`/article/edit/${id}`)
}

// 删除文章
const handleDeleteArticle = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文章「${row.title}」吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'delete-confirm-dialog'
      }
    )
    
    await articleAPI.deleteArticle(row.id)
    ElMessage.success('删除成功')
    fetchArticles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除文章失败:', error)
    }
  }
}

// 批量操作确认
const handleBatchConfirm = async () => {
  if (selection.value.length === 0) {
    ElMessage.warning('请选择要操作的文章')
    return
  }

  let confirmMsg = ''
  let successMsg = ''
  
  switch (batchAction.value) {
    case 'delete':
      confirmMsg = `确定要删除选中的 ${selection.value.length} 篇文章吗？此操作不可撤销。`
      successMsg = '批量删除成功'
      break
    case 'publish':
      confirmMsg = `确定要将选中的 ${selection.value.length} 篇文章设置为已发布状态吗？`
      successMsg = '批量发布成功'
      break
    case 'draft':
      confirmMsg = `确定要将选中的 ${selection.value.length} 篇文章设置为草稿状态吗？`
      successMsg = '批量设为草稿成功'
      break
    case 'move':
      if (!targetCategory.value) {
        ElMessage.warning('请选择目标分类')
        return
      }
      const targetCategoryName = categories.value.find(c => c.id === targetCategory.value)?.name || ''
      confirmMsg = `确定要将选中的 ${selection.value.length} 篇文章移动到分类「${targetCategoryName}」吗？`
      successMsg = '批量移动成功'
      break
  }

  try {
    await ElMessageBox.confirm(confirmMsg, '操作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: batchAction.value === 'delete' ? 'warning' : 'info'
    })
    
    batchLoading.value = true
    let params = { action: batchAction.value }
    
    if (batchAction.value === 'move' && targetCategory.value) {
      params.categoryId = targetCategory.value
    }
    
    await articleAPI.batchUpdateArticles(selection.value, params)
    ElMessage.success(successMsg)
    batchDialogVisible.value = false
    fetchArticles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
      console.error('批量操作失败:', error)
    }
  } finally {
    batchLoading.value = false
  }
}

// 关闭批量对话框
const handleBatchDialogClose = () => {
  batchAction.value = 'delete'
  targetCategory.value = ''
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  fetchArticles()
}

const handleCurrentChange = (current) => {
  pagination.value.currentPage = current
  fetchArticles()
}

// 生命周期
onMounted(() => {
  initData()
})
</script>

<style scoped>
/* 全局样式重置 */
.article-list-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航栏 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breadcrumb {
  font-size: 14px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.create-btn {
  padding: 10px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon-wrapper.primary {
  background-color: #e6f7ff;
  color: #1890ff;
}

.stat-icon-wrapper.success {
  background-color: #f6ffed;
  color: #52c41a;
}

.stat-icon-wrapper.warning {
  background-color: #fffbe6;
  color: #faad14;
}

.stat-icon-wrapper.info {
  background-color: #f0f5ff;
  color: #722ed1;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 32px;
}

.search-card {
  border-radius: 12px;
  background-color: #fff;
  overflow: hidden;
}

.search-form {
  padding: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
}

.search-item {
  margin-bottom: 0;
}

.search-input,
.search-select,
.date-picker {
  width: 200px;
}

.search-actions {
  display: flex;
  gap: 12px;
}

.search-btn,
.reset-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
}

/* 表格区域 */
.table-section {
  margin-bottom: 32px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.batch-btn {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
}

.table-card {
  border-radius: 12px;
  background-color: #fff;
  overflow: hidden;
}

.table-container {
  position: relative;
  min-height: 400px;
}

:deep(.el-table) {
  border: none;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__inner-wrapper) {
  border-radius: 8px;
}

:deep(.el-table__row) {
  transition: background-color 0.2s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f8fafc !important;
}

.title-link {
  color: #1e293b;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-block;
}

.title-link:hover {
  color: #1890ff;
  transform: translateX(2px);
}

/* 标签样式 */
.category-tag,
.status-tag {
  font-weight: 500;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.tag-0 { color: #4f46e5; background-color: #eef2ff; }
.tag-1 { color: #10b981; background-color: #d1fae5; }
.tag-2 { color: #f59e0b; background-color: #fef3c7; }
.tag-3 { color: #ef4444; background-color: #fee2e2; }
.tag-4 { color: #8b5cf6; background-color: #ede9fe; }

.more-tags {
  font-size: 12px;
}

/* 统计项 */
.count-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #64748b;
}

.count-icon {
  font-size: 16px;
}

/* 日期信息 */
.date-info {
  font-size: 14px;
  color: #64748b;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 4px;
}

.view-btn,
.edit-btn,
.delete-btn {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
}

.delete-btn {
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background-color: #ff4d4f;
  border-color: #ff4d4f;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
}

.empty-container {
  text-align: center;
}

.empty-action-btn {
  margin-top: 24px;
  padding: 10px 24px;
  font-size: 16px;
  border-radius: 8px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 24px;
  border-top: 1px solid #e2e8f0;
}

:deep(.el-pagination) {
  display: flex;
  align-items: center;
  gap: 16px;
}

:deep(.el-pagination__sizes .el-input__wrapper) {
  width: 100px;
}

/* 批量操作对话框 */
.modern-dialog {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background-color: #f8fafc;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

.batch-actions-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.batch-info {
  padding: 12px 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
}

.batch-info p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.batch-info strong {
  color: #1890ff;
  font-size: 16px;
}

.action-selection {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-radio {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.action-radio:hover {
  background-color: #f8fafc;
}

.radio-icon {
  font-size: 20px;
}

.radio-icon.primary {
  color: #1890ff;
}

.radio-icon.success {
  color: #52c41a;
}

.radio-icon.warning {
  color: #faad14;
}

.radio-icon.danger {
  color: #ff4d4f;
}

.category-selection {
  margin-top: 8px;
}

.category-select {
  width: 100%;
}

:deep(.el-dialog__footer) {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 删除确认对话框 */
:deep(.delete-confirm-dialog .el-message-box__title) {
  color: #ff4d4f;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-input,
  .search-select,
  .date-picker {
    width: 180px;
  }
}

@media (max-width: 768px) {
  .article-list-container {
    padding: 16px;
  }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-value {
    font-size: 32px;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
  }
  
  .search-input,
  .search-select,
  .date-picker {
    width: 100%;
  }
  
  .search-actions {
    justify-content: center;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .pagination-wrapper {
    padding: 16px;
  }
  
  :deep(.el-table) {
    font-size: 14px;
  }
  
  :deep(.el-table__column) {
    padding-left: 8px;
    padding-right: 8px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .view-btn,
  .edit-btn,
  .delete-btn {
    padding: 2px 8px;
    font-size: 11px;
  }
  
  .tags-container {
    flex-wrap: wrap;
  }
  
  .tag-item {
    font-size: 11px;
    padding: 1px 6px;
  }
}

@media (max-width: 480px) {
  .article-list-container {
    padding: 12px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .stat-card-content {
    gap: 12px;
  }
  
  .stat-icon-wrapper {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  :deep(.el-pagination__sizes) {
    order: -1;
    width: 100%;
    text-align: center;
  }
}
</style>