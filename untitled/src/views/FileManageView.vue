<template>
  <div class="file-manage-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>文件管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showUploadDialog = true" :loading="fileStore.loading.upload" size="large" class="touch-friendly">
          <el-icon><UploadFilled /></el-icon>
          上传文件
        </el-button>
        <el-button @click="exportFileList" size="large" class="touch-friendly">
          <el-icon><Download /></el-icon>
          导出列表
        </el-button>
        <el-button @click="resetFilter" size="large" class="touch-friendly">
          <el-icon><Refresh /></el-icon>
          重置筛选
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6" :xs="12" :sm="6" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ fileStore.fileStats.total || 0 }}</div>
            <div class="stat-label">文件总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="12" :sm="6" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ imageCount }}</div>
            <div class="stat-label">图片文件</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="12" :sm="6" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ documentCount }}</div>
            <div class="stat-label">文档文件</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="12" :sm="6" :md="6" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ otherCount }}</div>
            <div class="stat-label">其他文件</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选 -->
    <el-form :inline="false" :model="filterForm" class="filter-form mobile-form">
      <el-form-item label="关键词搜索">
        <el-input
          v-model="filterForm.keyword"
          placeholder="文件名、描述等"
          clearable
          @input="handleSearch"
          size="large"
          class="touch-friendly"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="文件类型">
        <el-select
          v-model="filterForm.fileType"
          placeholder="选择文件类型"
          clearable
          @change="handleTypeFilter"
          size="large"
          class="touch-friendly"
        >
          <el-option label="图片文件" value="image"></el-option>
          <el-option label="文档文件" value="document"></el-option>
          <el-option label="其他文件" value="other"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="排序方式">
        <div class="sort-controls">
          <el-select
            v-model="filterForm.sortBy"
            placeholder="排序方式"
            @change="handleSort"
            size="large"
            class="touch-friendly"
          >
            <el-option label="创建时间" value="created_at"></el-option>
            <el-option label="文件名" value="name"></el-option>
            <el-option label="文件大小" value="size"></el-option>
          </el-select>
          <el-button
            size="large"
            :icon="filterForm.order === 'desc' ? 'ArrowDownBold' : 'ArrowUpBold'"
            @click="toggleOrder"
            class="sort-order-btn touch-friendly"
          ></el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- 文件列表 -->
    <el-card class="file-list-card">
      <div class="file-list-header">
        <h2>文件列表</h2>
        <div class="list-actions">
          <el-button
            type="danger"
            size="large"
            @click="showDeleteConfirm"
            :disabled="!selectedFiles.length"
            :loading="fileStore.loading.delete"
            class="touch-friendly"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button
            size="large"
            @click="batchDownload"
            :disabled="!selectedFiles.length"
            class="touch-friendly"
          >
            <el-icon><Download /></el-icon>
            批量下载
          </el-button>
        </div>
      </div>

      <!-- 移动端卡片视图 -->
      <div class="file-card-list" v-if="isMobile">
        <el-card 
          v-for="file in fileStore.getFiles" 
          :key="file.id"
          shadow="hover"
          class="file-card touch-friendly"
          @click="viewFile(file)"
        >
          <div class="file-card-header">
            <el-checkbox v-model="selectedFileIds" :label="file.id" @click.stop></el-checkbox>
            <div class="file-icon">
              <el-avatar :size="48" :src="getThumbnailUrl(file)" v-if="isImageFile(file)"></el-avatar>
              <el-icon v-else-if="isDocumentFile(file)"><Document /></el-icon>
              <el-icon v-else><JPG /></el-icon>
            </div>
          </div>
          <h3 class="file-card-name">{{ file.name }}</h3>
          <div class="file-card-info">
            <span class="file-type">{{ file.type }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <div class="file-card-date">{{ formatDate(file.created_at) }}</div>
          <div class="file-card-actions">
            <el-button size="small" @click.stop="downloadFile(file.id)">下载</el-button>
            <el-button size="small" type="danger" @click.stop="deleteFile(file.id)">删除</el-button>
          </div>
        </el-card>
      </div>

      <!-- 桌面端表格视图 -->
      <el-table
        v-else
        v-loading="fileStore.loading.list"
        :data="fileStore.getFiles"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @row-dblclick="handleRowDblClick"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="文件名" min-width="200">
          <template #default="{ row }">
            <div class="file-name-cell">
              <el-avatar :size="32" :src="getThumbnailUrl(row)" v-if="isImageFile(row)"></el-avatar>
              <el-icon v-else-if="isDocumentFile(row)"><Document /></el-icon>
              <el-icon v-else><JPG /></el-icon>
              <span class="file-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="文件类型" width="120"></el-table-column>
        <el-table-column prop="size" label="文件大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewFile(row)" class="touch-friendly">查看</el-button>
            <el-button size="small" @click="downloadFile(row.id)" class="touch-friendly">下载</el-button>
            <el-button size="small" type="danger" @click="deleteFile(row.id)" class="touch-friendly">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="fileStore.pagination.currentPage"
          v-model:page-size="fileStore.pagination.pageSize"
          :page-sizes="isMobile ? [5, 10, 20] : [10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="fileStore.pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="touch-friendly"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 上传文件对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传文件"
      :width="isMobile ? '90%' : '600px'"
      @close="handleUploadDialogClose"
    >
      <el-upload
        v-model:file-list="uploadFileList"
        class="upload-demo touch-friendly"
        action=""
        :http-request="handleUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :on-progress="handleUploadProgress"
        :multiple="true"
        drag
        :disabled="fileStore.loading.upload"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持单个或批量上传，单次最多上传10个文件，每个文件不超过100MB
          </div>
        </template>
      </el-upload>

      <!-- 上传进度 -->
      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
        <el-progress :percentage="uploadProgress" :format="formatProgress"></el-progress>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUploadDialog = false" size="large" class="touch-friendly">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="fileStore.loading.upload" size="large" class="touch-friendly">
            确定上传
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看文件对话框 -->
    <el-dialog
      v-model="showViewDialog"
      :title="`查看文件 - ${currentFile?.name || ''}`"
      :width="isMobile ? '95%' : '800px'"
    >
      <div v-if="currentFile" class="file-view-content">
        <div v-if="isImageFile(currentFile)" class="image-preview">
          <img :src="getFullUrl(currentFile)" alt="文件预览" style="max-width: 100%; max-height: 500px; object-fit: contain;">
        </div>
        <div v-else class="file-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件名">{{ currentFile.name }}</el-descriptions-item>
            <el-descriptions-item label="文件类型">{{ currentFile.type }}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{ formatFileSize(currentFile.size) }}</el-descriptions-item>
            <el-descriptions-item label="上传时间">{{ formatDate(currentFile.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="文件路径" :span="2">{{ currentFile.path || '-' }}</el-descriptions-item>
            <el-descriptions-item label="文件URL" :span="2">
              <a :href="getFullUrl(currentFile)" target="_blank">{{ getFullUrl(currentFile) }}</a>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>

    <!-- 错误提示 -->
    <el-notification
      v-if="fileStore.getError"
      title="错误"
      :message="fileStore.getError"
      type="error"
      duration="5000"
      @close="fileStore.resetError"
    ></el-notification>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useFileStore } from '../stores/fileStore';
import { UploadFilled, Download, Refresh, Search, Delete, Document, JPG, ArrowDownBold, ArrowUpBold } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 文件存储实例
const fileStore = useFileStore();

// 响应式数据
const showUploadDialog = ref(false);
const showViewDialog = ref(false);
const currentFile = ref(null);
const uploadFileList = ref([]);
const selectedFiles = ref([]);
const selectedFileIds = ref([]); // 用于移动端多选
const uploadProgress = ref(0);
const isMobile = ref(false); // 检测是否为移动端

// 过滤表单
const filterForm = ref({
  keyword: '',
  fileType: '',
  sortBy: 'created_at',
  order: 'desc'
});

// 计算属性
const imageCount = computed(() => {
  return fileStore.getFiles.filter(file => isImageFile(file)).length;
});

const documentCount = computed(() => {
  return fileStore.getFiles.filter(file => isDocumentFile(file)).length;
});

const otherCount = computed(() => {
  return fileStore.getFiles.filter(file => !isImageFile(file) && !isDocumentFile(file)).length;
});

// 检测窗口大小变化的方法
const checkIfMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// 监听选中的文件ID变化，同步到selectedFiles
const handleSelectedIdsChange = () => {
  selectedFiles.value = fileStore.getFiles.filter(file => 
    selectedFileIds.value.includes(file.id)
  );
};

// 生命周期钩子
onMounted(async () => {
  // 初始化数据
  await Promise.all([
    fileStore.fetchFiles(),
    fileStore.fetchFileStats()
  ]);
  
  // 初始化检测窗口大小
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
});

// 组件卸载时移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIfMobile);
});

// 监听selectedFileIds变化
selectedFileIds.value = selectedFileIds.value;
selectedFileIds.value.length && handleSelectedIdsChange();

// 方法

// 搜索文件
const handleSearch = (val) => {
  // 防抖处理
  clearTimeout(window.searchTimer);
  window.searchTimer = setTimeout(() => {
    fileStore.searchFiles(val);
  }, 300);
};

// 类型过滤
const handleTypeFilter = (type) => {
  fileStore.filterFilesByType(type);
};

// 排序
const handleSort = (sortBy) => {
  fileStore.sortFiles(sortBy, filterForm.value.order);
};

// 切换排序顺序
const toggleOrder = () => {
  filterForm.value.order = filterForm.value.order === 'desc' ? 'asc' : 'desc';
  handleSort(filterForm.value.sortBy);
};

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    keyword: '',
    fileType: '',
    sortBy: 'created_at',
    order: 'desc'
  };
  fileStore.resetSearchParams();
  fileStore.fetchFiles({ page: 1 });
};

// 分页大小变化
const handleSizeChange = (size) => {
  fileStore.changePageSize(size);
};

// 当前页变化
const handleCurrentChange = (current) => {
  fileStore.changePage(current);
};

// 选择变化
const handleSelectionChange = (selection) => {
  selectedFiles.value = selection;
};

// 双击行
const handleRowDblClick = (row) => {
  viewFile(row);
};

// 查看文件
const viewFile = (file) => {
  currentFile.value = file;
  showViewDialog.value = true;
};

// 下载文件
const downloadFile = async (id) => {
  try {
    const response = await fileStore.downloadFile(id);
    // 处理下载响应
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', response.headers['content-disposition']?.split('filename=')[1] || `file-${id}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('下载文件失败');
  }
};

// 批量下载
const batchDownload = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要下载的文件');
    return;
  }
  
  try {
    await fileStore.batchDownloadFiles(selectedFiles.value.map(file => file.id));
    ElMessage.success('批量下载成功');
  } catch (error) {
    ElMessage.error('批量下载失败');
  }
};

// 删除文件
const deleteFile = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该文件吗？此操作不可撤销。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await fileStore.deleteFile(id);
    ElMessage.success('文件删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('文件删除失败');
    }
  }
};

// 批量删除
const showDeleteConfirm = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要删除的文件');
    return;
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedFiles.value.length} 个文件吗？此操作不可撤销。`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await fileStore.batchDeleteFiles(selectedFiles.value.map(file => file.id));
    selectedFiles.value = [];
    selectedFileIds.value = [];
    ElMessage.success('批量删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败');
    }
  }
};

// 导出文件列表
const exportFileList = async () => {
  try {
    await fileStore.exportFileList();
    ElMessage.success('文件列表导出成功');
  } catch (error) {
    ElMessage.error('文件列表导出失败');
  }
};

// 处理上传
const handleUpload = async (options) => {
  try {
    uploadProgress.value = 0;
    const response = await fileStore.uploadFile(options.file, (progress) => {
      uploadProgress.value = Math.floor(progress.percent);
    });
    options.onSuccess(response);
  } catch (error) {
    options.onError(error);
  }
};

// 上传成功
const handleUploadSuccess = (response) => {
  ElMessage.success('文件上传成功');
  uploadProgress.value = 0;
};

// 上传失败
const handleUploadError = (error) => {
  ElMessage.error('文件上传失败');
  uploadProgress.value = 0;
};

// 上传进度
const handleUploadProgress = (event, file, fileList) => {
  uploadProgress.value = Math.floor(event.percent);
};

// 提交上传
const submitUpload = async () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件');
    return;
  }
  
  try {
    // 批量上传
    await Promise.all(
      uploadFileList.value.map(file => fileStore.uploadFile(file.raw))
    );
    showUploadDialog.value = false;
    ElMessage.success('全部文件上传成功');
  } catch (error) {
    ElMessage.error('文件上传失败');
  }
};

// 关闭上传对话框
const handleUploadDialogClose = () => {
  uploadFileList.value = [];
  uploadProgress.value = 0;
};

// 工具函数

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 判断是否为图片文件
const isImageFile = (file) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return imageTypes.includes(file.type) || file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
};

// 判断是否为文档文件
const isDocumentFile = (file) => {
  const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  return docTypes.includes(file.type) || file.name?.match(/\.(pdf|doc|docx|xls|xlsx)$/i);
};

// 获取缩略图URL
const getThumbnailUrl = (file) => {
  // 模拟缩略图URL，实际项目中应该从后端获取
  return isImageFile(file) ? `/${file.path || 'uploads/' + file.name}` : '';
};

// 获取完整URL
const getFullUrl = (file) => {
  // 模拟完整URL，实际项目中应该从后端获取
  return `/${file.path || 'uploads/' + file.name}`;
};

// 格式化进度
const formatProgress = (percentage) => {
  return `${percentage}%`;
};
</script>

<style scoped>
.file-manage-container {
  padding: 16px;
  background-color: var(--background-color);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 10px;
}

.filter-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: var(--card-background);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.mobile-form .el-form-item {
  margin-bottom: 15px;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-order-btn {
  margin-left: 0;
}

.file-list-card {
  margin-bottom: 20px;
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.file-list-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.list-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-name {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.upload-progress {
  margin-top: 15px;
}

.file-view-content {
  padding: 10px;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background-color: var(--background-color);
  border-radius: 4px;
  overflow: hidden;
}

.file-info {
  padding: 10px 0;
}

/* 移动端文件卡片视图 */
.file-card-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-card {
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--card-background);
  border: 1px solid var(--border-color);
  padding: 15px;
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
}

.file-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 24px;
  color: var(--primary-color);
}

.file-card-name {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-card-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.file-card-date {
  font-size: 12px;
  color: var(--text-disabled);
  margin-bottom: 10px;
}

.file-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 触摸友好样式 */
.touch-friendly {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.touch-friendly:active {
  transform: scale(0.98);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-manage-container {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .header-actions .el-button {
    flex: 1;
    margin: 0 5px;
  }
  
  .header-actions .el-button:first-child {
    margin-left: 0;
  }
  
  .header-actions .el-button:last-child {
    margin-right: 0;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .stat-content {
    padding: 15px 0;
  }
  
  .file-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .list-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .list-actions .el-button {
    flex: 1;
    margin: 0 5px;
  }
  
  .list-actions .el-button:first-child {
    margin-left: 0;
  }
  
  .list-actions .el-button:last-child {
    margin-right: 0;
  }
  
  .file-name {
    max-width: 180px;
  }
  
  .pagination-container {
    overflow-x: auto;
    padding-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .file-manage-container {
    padding: 8px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-actions .el-button {
    margin: 0;
    width: 100%;
  }
  
  .list-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .list-actions .el-button {
    margin: 0;
    width: 100%;
  }
  
  .file-card-info {
    flex-direction: column;
    gap: 5px;
  }
  
  .file-card-actions {
    flex-direction: column;
  }
  
  .file-card-actions .el-button {
    width: 100%;
  }
  
  .sort-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .sort-order-btn {
    margin-top: 10px;
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] .file-manage-container {
  background-color: var(--background-color-dark);
}

[data-theme="dark"] .stat-card,
[data-theme="dark"] .filter-form,
[data-theme="dark"] .file-list-card,
[data-theme="dark"] .file-card {
  background-color: var(--card-background-dark);
  border-color: var(--border-color-dark);
}

[data-theme="dark"] .stat-number {
  color: var(--primary-color-dark);
}

[data-theme="dark"] .stat-label,
[data-theme="dark"] .file-card-info,
[data-theme="dark"] .file-card-date {
  color: var(--text-secondary-dark);
}

[data-theme="dark"] .file-name,
[data-theme="dark"] .file-card-name {
  color: var(--text-primary-dark);
}

[data-theme="dark"] .image-preview {
  background-color: var(--background-color-dark);
}
</style>