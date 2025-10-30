<template>
  <div class="tag-manage">
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span>标签管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog">添加标签</el-button>
            <el-button v-if="selectedTags.length > 0" type="danger" @click="showBatchDeleteDialog">批量删除</el-button>
          </div>
        </div>
      </template>
      
      <div class="filter-container mb-4">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索标签名称" 
          prefix-icon="Search" 
          class="mr-2"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="sortBy" placeholder="排序方式" class="mr-2">
          <el-option label="使用次数（降序）" :value="'usageCount:desc'" />
          <el-option label="使用次数（升序）" :value="'usageCount:asc'" />
          <el-option label="创建时间（降序）" :value="'createdAt:desc'" />
          <el-option label="创建时间（升序）" :value="'createdAt:asc'" />
          <el-option label="名称（A-Z）" :value="'name:asc'" />
          <el-option label="名称（Z-A）" :value="'name:desc'" />
        </el-select>
        <el-button @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
      
      <!-- 热门标签展示 -->
      <div class="hot-tags-section mb-4">
        <h3 class="section-title">热门标签</h3>
        <div class="hot-tags">
          <el-tag
            v-for="tag in hotTags"
            :key="tag.id"
            :size="getTagSize(tag.usageCount)"
            effect="light"
            @click="handleTagClick(tag)"
          >
            {{ tag.name }} <span class="tag-count">({{ tag.usageCount }})</span>
          </el-tag>
        </div>
      </div>
      
      <!-- 标签表格 -->
      <el-table
        v-loading="tagStore.isLoading"
        :data="tagStore.tags"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="标签名称" width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.name }}</el-tag>
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
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="text" size="small" @click.stop="showEditDialog(row)">编辑</el-button>
            <el-button type="text" size="small" danger @click.stop="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tagStore.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑标签对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="400px"
      @close="handleDialogClose"
    >
      <el-form
        ref="tagFormRef"
        :model="tagForm"
        :rules="tagRules"
        label-width="80px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        
        <el-form-item label="标签描述" prop="description">
          <el-input
            v-model="tagForm.description"
            placeholder="请输入标签描述（可选）"
            type="textarea"
            rows="3"
          />
        </el-form-item>
        
        <el-form-item label="标签颜色" prop="color">
          <el-input
            v-model="tagForm.color"
            placeholder="请输入颜色代码（如：#ff0000）"
          />
          <div 
            v-if="tagForm.color" 
            class="color-preview"
            :style="{ backgroundColor: tagForm.color }"
          ></div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 批量删除确认对话框 -->
    <el-dialog
      v-model="batchDeleteVisible"
      title="批量删除确认"
      width="400px"
    >
      <p>确定要删除选中的 <strong>{{ selectedTags.length }}</strong> 个标签吗？</p>
      
      <template #footer>
        <el-button @click="batchDeleteVisible = false">取消</el-button>
        <el-button type="danger" @click="handleBatchDelete">确定删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useTagStore } from '../stores/tagStore';

// 标签store
const tagStore = useTagStore();

// 响应式数据
const searchKeyword = ref('');
const sortBy = ref('usageCount:desc');
const dialogVisible = ref(false);
const batchDeleteVisible = ref(false);
const tagFormRef = ref(null);
const selectedTags = ref([]);
const tagForm = reactive({
  id: '',
  name: '',
  description: '',
  color: ''
});
const dialogMode = ref('add'); // 'add' 或 'edit'

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
});

// 表单验证规则
const tagRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '标签名称长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  color: [
    { pattern: /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})?$/, message: '请输入有效的颜色代码', trigger: 'blur' }
  ]
};

// 计算属性
const dialogTitle = computed(() => {
  return dialogMode.value === 'edit' ? '编辑标签' : '添加标签';
});

// 热门标签（取使用次数最多的10个）
const hotTags = computed(() => {
  return [...tagStore.tags]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
});

// 方法
// 初始化
const initData = async () => {
  try {
    await fetchTags();
  } catch (error) {
    ElMessage.error('获取标签列表失败');
  }
};

// 获取标签列表
const fetchTags = async () => {
  try {
    await tagStore.fetchTags({
      keyword: searchKeyword.value,
      sortBy: sortBy.value,
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
    ElMessage.error('搜索标签失败');
  }
};

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = '';
  sortBy.value = 'usageCount:desc';
  pagination.currentPage = 1;
  pagination.pageSize = 10;
  initData();
};

// 显示添加对话框
const showAddDialog = () => {
  resetForm();
  dialogMode.value = 'add';
  dialogVisible.value = true;
};

// 显示编辑对话框
const showEditDialog = (tag) => {
  dialogMode.value = 'edit';
  tagForm.id = tag.id;
  tagForm.name = tag.name;
  tagForm.description = tag.description || '';
  tagForm.color = tag.color || '';
  dialogVisible.value = true;
};

// 显示批量删除对话框
const showBatchDeleteDialog = () => {
  batchDeleteVisible.value = true;
};

// 重置表单
const resetForm = () => {
  if (tagFormRef.value) {
    tagFormRef.value.resetFields();
  }
  tagForm.id = '';
  tagForm.name = '';
  tagForm.description = '';
  tagForm.color = '';
};

// 处理对话框关闭
const handleDialogClose = () => {
  resetForm();
  dialogVisible.value = false;
};

// 处理标签点击
const handleTagClick = (tag) => {
  console.log('点击了标签:', tag);
};

// 处理行点击
const handleRowClick = (row, column, event) => {
  // 点击非复选框区域取消选中状态
  if (column.type !== 'selection') {
    selectedTags.value = [];
  }
};

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedTags.value = selection;
};

// 提交表单
const handleSubmit = async () => {
  try {
    await tagFormRef.value.validate();
    
    // 检查名称是否重复
    if (tagStore.isTagNameExists(tagForm.name, tagForm.id)) {
      ElMessage.error('标签名称已存在');
      return;
    }
    
    let result;
    if (dialogMode.value === 'edit') {
      result = await tagStore.updateTag(tagForm.id, {
        name: tagForm.name,
        description: tagForm.description,
        color: tagForm.color
      });
      ElMessage.success('标签更新成功');
    } else {
      result = await tagStore.createTag({
        name: tagForm.name,
        description: tagForm.description,
        color: tagForm.color
      });
      ElMessage.success('标签创建成功');
    }
    
    handleDialogClose();
    await fetchTags(); // 刷新列表
  } catch (error) {
    if (error === false) return; // 表单验证失败
    ElMessage.error(error.message || '操作失败');
  }
};

// 删除标签
const handleDelete = async (tag) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除标签「${tag.name}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await tagStore.deleteTag(tag.id);
    ElMessage.success('标签删除成功');
    await fetchTags(); // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 批量删除标签
const handleBatchDelete = async () => {
  try {
    const tagIds = selectedTags.value.map(tag => tag.id);
    await tagStore.batchDeleteTags(tagIds);
    ElMessage.success(`成功删除 ${selectedTags.value.length} 个标签`);
    batchDeleteVisible.value = false;
    selectedTags.value = [];
    await fetchTags(); // 刷新列表
  } catch (error) {
    ElMessage.error(error.message || '批量删除失败');
  }
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

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
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
.tag-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
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
  margin-left: 10px;
  border: 1px solid #dcdfe6;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
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