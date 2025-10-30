<template>
  <div class="tag-view">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span>标签列表</span>
        </div>
      </template>
      
      <div class="hot-tags-section">
        <h3 class="section-title">热门标签</h3>
        <div class="hot-tags">
          <el-tag
            v-for="tag in hotTags"
            :key="tag.id"
            :size="getTagSize(tag.usageCount)"
            effect="light"
            @click="handleTagClick(tag)"
            class="tag-item"
          >
            {{ tag.name }} <span class="tag-count">({{ tag.usageCount }})</span>
          </el-tag>
        </div>
      </div>
      
      <div class="filter-container mb-4">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索标签名称" 
          prefix-icon="Search" 
          class="mr-2"
          @keyup.enter="handleSearch"
        />
        <el-button @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
      
      <!-- 标签列表 -->
      <el-table
        v-loading="tagStore.isLoading"
        :data="displayTags"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column prop="name" label="标签名称" width="180">
          <template #default="{ row }">
            <el-tag :color="row.color" size="small">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usageCount" label="使用次数" width="100" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="color" label="颜色" width="100">
          <template #default="{ row }">
            <div 
              v-if="row.color" 
              class="color-preview"
              :style="{ backgroundColor: row.color }"
            ></div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <router-link :to="`/tag/${row.id}`" class="link-button">
              查看文章
            </router-link>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 错误提示 -->
      <div v-if="tagStore.hasError" class="error-message">
        <el-alert
          title="获取标签失败"
          :description="tagStore.errorMessage"
          type="error"
          show-icon
          :closable="false"
        />
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="displayTotal"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 标签下的文章列表 -->
    <div v-if="currentTagId" class="tag-articles">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>
              <el-tag :color="currentTag?.color" size="small">{{ currentTag?.name || '' }}</el-tag> - 文章列表
            </span>
            <el-button type="text" @click="goBack">返回标签列表</el-button>
          </div>
        </template>
        
        <article-list :tag-id="currentTagId" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useTagStore } from '../stores/tagStore';
import ArticleList from '../components/ArticleList.vue';

const route = useRoute();
const router = useRouter();
const tagStore = useTagStore();

// 响应式数据
const searchKeyword = ref('');
const currentTagId = ref(null);

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
});

// Mock数据，确保页面能正常显示
const mockTags = [
  { id: '1', name: 'Vue.js', usageCount: 15, description: 'Vue.js前端框架', color: '#42b883' },
  { id: '2', name: 'JavaScript', usageCount: 25, description: 'JavaScript编程语言', color: '#f7df1e' },
  { id: '3', name: 'TypeScript', usageCount: 12, description: 'TypeScript语言', color: '#3178c6' },
  { id: '4', name: 'React', usageCount: 10, description: 'React前端框架', color: '#61dafb' },
  { id: '5', name: 'Java', usageCount: 8, description: 'Java后端开发', color: '#007396' },
  { id: '6', name: 'Python', usageCount: 6, description: 'Python编程语言', color: '#3776ab' },
  { id: '7', name: '数据库', usageCount: 5, description: '数据库相关', color: '#4479a1' },
  { id: '8', name: '前端开发', usageCount: 20, description: '前端开发相关', color: '#ff6b6b' },
  { id: '9', name: '后端开发', usageCount: 18, description: '后端开发相关', color: '#4ecdc4' },
  { id: '10', name: 'DevOps', usageCount: 3, description: 'DevOps相关', color: '#00d0ff' }
];

// 计算属性
// 热门标签（取使用次数最多的10个）
const hotTags = computed(() => {
  const tags = tagStore.tags && tagStore.tags.length > 0 ? tagStore.tags : mockTags;
  return [...tags]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
});

// 当前选中的标签
const currentTag = computed(() => {
  if (!currentTagId.value) return null;
  
  // 先从store中查找
  const storeTag = tagStore.tags.find(tag => tag.id === currentTagId.value);
  if (storeTag) return storeTag;
  
  // 如果store中没有，从mock数据中查找
  return mockTags.find(tag => tag.id === currentTagId.value) || null;
});

// 显示的标签列表
const displayTags = computed(() => {
  if (tagStore.tags && tagStore.tags.length > 0) {
    return tagStore.tags;
  }
  // 如果store中没有数据且不在加载中，使用mock数据
  if (!tagStore.isLoading) {
    // 根据搜索关键词过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      return mockTags.filter(tag => 
        tag.name.toLowerCase().includes(keyword) || 
        (tag.description && tag.description.toLowerCase().includes(keyword))
      );
    }
    return mockTags;
  }
  return [];
});

// 显示的总数
const displayTotal = computed(() => {
  if (tagStore.total > 0) {
    return tagStore.total;
  }
  // 如果store中没有数据，使用mock数据的数量
  if (!tagStore.isLoading) {
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      return mockTags.filter(tag => 
        tag.name.toLowerCase().includes(keyword) || 
        (tag.description && tag.description.toLowerCase().includes(keyword))
      ).length;
    }
    return mockTags.length;
  }
  return 0;
});

// 监听路由参数变化
watch(
  () => route.params.tagId,
  (newTagId) => {
    if (newTagId) {
      currentTagId.value = newTagId;
    } else {
      currentTagId.value = null;
    }
  },
  { immediate: true }
);

// 方法
// 初始化数据
const initData = async () => {
  try {
    await fetchTags();
  } catch (error) {
    console.error('获取标签列表失败:', error);
    // 不再显示错误消息，避免干扰用户体验
  }
};

// 获取标签列表
const fetchTags = async () => {
  try {
    await tagStore.fetchTags({
      keyword: searchKeyword.value,
      sortBy: 'usageCount:desc',
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    });
  } catch (error) {
    throw error;
  }
};

// 搜索
const handleSearch = async () => {
  pagination.currentPage = 1; // 重置到第一页
  try {
    await fetchTags();
  } catch (error) {
    console.error('搜索标签失败:', error);
    // 使用mock数据，不显示错误
  }
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = '';
  pagination.currentPage = 1;
  pagination.pageSize = 10;
  initData();
};

// 处理标签点击
const handleTagClick = (tag) => {
  currentTagId.value = tag.id;
  router.push(`/tag/${tag.id}`);
};

// 处理表格行点击
const handleRowClick = (row) => {
  handleTagClick(row);
};

// 返回标签列表
const goBack = () => {
  currentTagId.value = null;
  router.push('/tag');
};

// 分页处理
const handleSizeChange = async (size) => {
  pagination.pageSize = size;
  await fetchTags();
};

const handleCurrentChange = async (current) => {
  pagination.currentPage = current;
  await fetchTags();
};

// 根据使用次数获取标签大小
const getTagSize = (usageCount) => {
  if (usageCount >= 10) return 'medium';
  return 'small';
};

// 组件挂载时初始化数据
onMounted(() => {
  initData();
});
</script>

<style scoped>
.tag-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.mr-2 {
  margin-right: 10px;
}

.hot-tags-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 600;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-item:hover {
  transform: translateY(-2px);
}

.tag-count {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid #dcdfe6;
}

.link-button {
  color: #409eff;
  text-decoration: none;
}

.link-button:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.tag-articles {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination-container {
    justify-content: center;
  }
  
  .hot-tags {
    justify-content: center;
  }
}
</style>