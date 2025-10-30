<template>
  <div class="comment-manage-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>评论管理</span>
          <el-button type="primary" size="small" @click="handleRefresh">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </template>
      
      <!-- 评论统计卡片 -->
      <div class="stats-card">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item total">
              <div class="stat-number">{{ commentStore.stats.total }}</div>
              <div class="stat-label">总评论数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item approved">
              <div class="stat-number">{{ commentStore.stats.approved }}</div>
              <div class="stat-label">已批准</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item pending">
              <div class="stat-number">{{ commentStore.stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item spam">
              <div class="stat-number">{{ commentStore.stats.spam }}</div>
              <div class="stat-label">垃圾评论</div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 搜索和筛选区域 -->
      <div class="search-filter">
        <el-row :gutter="20" align="middle">
          <el-col :span="8">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索评论内容、作者名称或邮箱"
              prefix-icon="el-icon-search"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="searchForm.status"
              placeholder="评论状态"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="已批准" value="approved" />
              <el-option label="待审核" value="pending" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="垃圾评论" value="spam" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateRangeChange"
              clearable
            />
          </el-col>
          <el-col :span="4" class="text-right">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button
          type="warning"
          :disabled="!selectedComments.length"
          @click="showBatchModerateDialog = true"
        >
          <el-icon><EditPen /></el-icon> 批量审核
        </el-button>
        <el-button
          type="danger"
          :disabled="!selectedComments.length"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
      </div>
      
      <!-- 评论列表表格 -->
      <el-table
        v-loading="commentStore.isLoading"
        :data="commentStore.comments"
        @selection-change="handleSelectionChange"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="content" label="评论内容" min-width="300">
          <template #default="{ row }">
            <div class="comment-content">
              {{ row.content }}
              <div v-if="row.parentId" class="reply-indicator">
                <el-icon><ChatDotRound /></el-icon>
                回复评论 #{{ row.parentId }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="articleTitle" label="所属文章" width="180">
          <template #default="{ row }">
            <router-link
              v-if="row.articleId"
              :to="`/articles/${row.articleId}`"
              target="_blank"
              class="article-link"
            >
              {{ row.articleTitle || '文章已被删除' }}
            </router-link>
            <span v-else class="text-muted">无关联文章</span>
          </template>
        </el-table-column>
        <el-table-column prop="authorName" label="作者" width="120" />
        <el-table-column prop="authorEmail" label="邮箱" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
              @click="showModerateDialog(row)"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="互动" width="140">
          <template #default="{ row }">
            <div class="interaction-buttons">
              <el-button
                size="small"
                type="text"
                :icon="CommentUp"
                @click="handleLikeComment(row.id, !row.isLiked)"
                :class="{ 'liked': row.isLiked }"
              >
                {{ row.likes }} 赞
              </el-button>
              <el-button
                size="small"
                type="text"
                :icon="ChatLineSquare"
                @click="showReplyDialog(row)"
              >
                {{ row.replies?.length || 0 }} 回复
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons-mini">
              <el-button
                type="primary"
                size="small"
                @click="showEditDialog(row)"
              >
                <el-icon><EditPen /></el-icon> 编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row.id)"
              >
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="commentStore.pagination.currentPage"
          v-model:page-size="commentStore.pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="commentStore.pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 编辑评论对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑评论"
      width="600px"
      @close="resetEditForm"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="评论内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            rows="5"
            placeholder="请输入评论内容"
          />
        </el-form-item>
        <el-form-item label="作者名称" prop="authorName">
          <el-input v-model="editForm.authorName" placeholder="请输入作者名称" />
        </el-form-item>
        <el-form-item label="作者邮箱" prop="authorEmail">
          <el-input v-model="editForm.authorEmail" placeholder="请输入作者邮箱" />
        </el-form-item>
        <el-form-item label="评论状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择评论状态">
            <el-option label="已批准" value="approved" />
            <el-option label="待审核" value="pending" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="垃圾评论" value="spam" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateComment">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 审核评论对话框 -->
    <el-dialog
      v-model="moderateDialogVisible"
      :title="`审核评论 #${moderateCommentId}`"
      width="400px"
    >
      <el-form
        ref="moderateFormRef"
        :model="moderateForm"
        :rules="moderateFormRules"
        label-width="100px"
      >
        <el-form-item label="评论状态" prop="status">
          <el-select v-model="moderateForm.status" placeholder="请选择评论状态">
            <el-option label="已批准" value="approved" />
            <el-option label="待审核" value="pending" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="垃圾评论" value="spam" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="moderateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleModerateComment">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量审核对话框 -->
    <el-dialog
      v-model="showBatchModerateDialog"
      :title="`批量审核 (${selectedComments.length}条)`"
      width="400px"
    >
      <el-form
        ref="batchModerateFormRef"
        :model="batchModerateForm"
        :rules="batchModerateFormRules"
        label-width="100px"
      >
        <el-form-item label="设置状态" prop="status">
          <el-select v-model="batchModerateForm.status" placeholder="请选择评论状态">
            <el-option label="已批准" value="approved" />
            <el-option label="待审核" value="pending" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="垃圾评论" value="spam" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBatchModerateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleBatchModerate">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 回复评论对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      :title="`回复评论 #${replyCommentId}`"
      width="600px"
      @close="resetReplyForm"
    >
      <div class="reply-original-comment">
        <div class="reply-original-header">原评论：</div>
        <div class="reply-original-content">{{ replyOriginalComment }}</div>
      </div>
      <el-form
        ref="replyFormRef"
        :model="replyForm"
        :rules="replyFormRules"
        label-width="80px"
        style="margin-top: 20px"
      >
        <el-form-item label="回复内容" prop="content">
          <el-input
            v-model="replyForm.content"
            type="textarea"
            rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleReplyComment">发送</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Refresh,
  EditPen,
  Delete,
  ChatDotRound,
  ChatLineSquare,
  CommentUp
} from '@element-plus/icons-vue';
import { useCommentStore } from '../stores/commentStore';

// 状态管理
const commentStore = useCommentStore();

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  startDate: '',
  endDate: ''
});

// 日期范围选择器
const dateRange = ref([]);

// 选中的评论
const selectedComments = ref([]);

// 编辑对话框
const editDialogVisible = ref(false);
const editFormRef = ref(null);
const editForm = reactive({
  id: null,
  content: '',
  authorName: '',
  authorEmail: '',
  status: ''
});

// 审核对话框
const moderateDialogVisible = ref(false);
const moderateFormRef = ref(null);
const moderateForm = reactive({
  status: ''
});
const moderateCommentId = ref(null);

// 批量审核对话框
const showBatchModerateDialog = ref(false);
const batchModerateFormRef = ref(null);
const batchModerateForm = reactive({
  status: ''
});

// 回复对话框
const replyDialogVisible = ref(false);
const replyFormRef = ref(null);
const replyForm = reactive({
  content: ''
});
const replyCommentId = ref(null);
const replyOriginalComment = ref('');
const replyArticleId = ref(null);

// 表单验证规则
const editFormRules = {
  content: [{ required: true, message: '请输入评论内容', trigger: 'blur' }],
  authorName: [{ required: true, message: '请输入作者名称', trigger: 'blur' }],
  authorEmail: [
    { required: true, message: '请输入作者邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择评论状态', trigger: 'blur' }]
};

const moderateFormRules = {
  status: [{ required: true, message: '请选择评论状态', trigger: 'blur' }]
};

const batchModerateFormRules = {
  status: [{ required: true, message: '请选择评论状态', trigger: 'blur' }]
};

const replyFormRules = {
  content: [{ required: true, message: '请输入回复内容', trigger: 'blur' }]
};

// 生命周期钩子
onMounted(() => {
  initData();
});

// 初始化数据
async function initData() {
  await Promise.all([
    commentStore.fetchComments(),
    commentStore.fetchCommentStats()
  ]);
}

// 获取状态类型
function getStatusType(status) {
  const typeMap = {
    approved: 'success',
    pending: 'warning',
    rejected: 'info',
    spam: 'danger'
  };
  return typeMap[status] || 'default';
}

// 获取状态文本
function getStatusText(status) {
  const textMap = {
    approved: '已批准',
    pending: '待审核',
    rejected: '已拒绝',
    spam: '垃圾评论'
  };
  return textMap[status] || status;
}

// 格式化日期时间
function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// 处理选择变化
function handleSelectionChange(selection) {
  selectedComments.value = selection;
}

// 处理搜索
async function handleSearch() {
  const params = {
    ...searchForm,
    page: 1
  };
  await commentStore.fetchComments(params);
}

// 处理日期范围变化
function handleDateRangeChange(range) {
  if (!range || range.length === 0) {
    searchForm.startDate = '';
    searchForm.endDate = '';
  } else {
    searchForm.startDate = range[0];
    searchForm.endDate = range[1];
  }
  handleSearch();
}

// 处理分页大小变化
async function handleSizeChange(pageSize) {
  commentStore.pagination.pageSize = pageSize;
  await commentStore.fetchComments();
}

// 处理页码变化
async function handleCurrentChange(currentPage) {
  commentStore.pagination.currentPage = currentPage;
  await commentStore.fetchComments();
}

// 处理刷新
async function handleRefresh() {
  await Promise.all([
    commentStore.fetchComments(),
    commentStore.fetchCommentStats()
  ]);
}

// 显示编辑对话框
function showEditDialog(comment) {
  editForm.id = comment.id;
  editForm.content = comment.content;
  editForm.authorName = comment.authorName;
  editForm.authorEmail = comment.authorEmail;
  editForm.status = comment.status;
  editDialogVisible.value = true;
}

// 重置编辑表单
function resetEditForm() {
  editFormRef.value?.resetFields();
  editForm.id = null;
  editForm.content = '';
  editForm.authorName = '';
  editForm.authorEmail = '';
  editForm.status = '';
}

// 处理更新评论
async function handleUpdateComment() {
  if (!editFormRef.value) return;
  
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      await commentStore.updateComment(editForm.id, {
        content: editForm.content,
        authorName: editForm.authorName,
        authorEmail: editForm.authorEmail,
        status: editForm.status
      });
      
      // 重新获取统计信息
      await commentStore.fetchCommentStats();
      
      // 关闭对话框
      editDialogVisible.value = false;
    } catch (error) {
      // 错误已在 store 中处理
    }
  });
}

// 显示审核对话框
function showModerateDialog(comment) {
  moderateCommentId.value = comment.id;
  moderateForm.status = comment.status;
  moderateDialogVisible.value = true;
}

// 处理审核评论
async function handleModerateComment() {
  if (!moderateFormRef.value) return;
  
  await moderateFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      await commentStore.moderateComment(moderateCommentId.value, moderateForm.status);
      
      // 重新获取统计信息
      await commentStore.fetchCommentStats();
      
      // 关闭对话框
      moderateDialogVisible.value = false;
    } catch (error) {
      // 错误已在 store 中处理
    }
  });
}

// 处理批量审核
async function handleBatchModerate() {
  if (!batchModerateFormRef.value) return;
  
  await batchModerateFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    const ids = selectedComments.value.map(comment => comment.id);
    
    try {
      await commentStore.batchModerateComments(ids, batchModerateForm.status);
      
      // 重新获取统计信息
      await commentStore.fetchCommentStats();
      
      // 清空选择和关闭对话框
      selectedComments.value = [];
      showBatchModerateDialog.value = false;
    } catch (error) {
      // 错误已在 store 中处理
    }
  });
}

// 显示回复对话框
function showReplyDialog(comment) {
  replyCommentId.value = comment.id;
  replyOriginalComment.value = comment.content;
  replyArticleId.value = comment.articleId;
  replyDialogVisible.value = true;
}

// 重置回复表单
function resetReplyForm() {
  replyFormRef.value?.resetFields();
  replyForm.content = '';
  replyCommentId.value = null;
  replyOriginalComment.value = '';
  replyArticleId.value = null;
}

// 处理回复评论
async function handleReplyComment() {
  if (!replyFormRef.value) return;
  
  await replyFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      await commentStore.createComment({
        content: replyForm.content,
        parentId: replyCommentId.value,
        articleId: replyArticleId.value,
        authorName: '管理员', // 假设是管理员回复
        authorEmail: 'admin@example.com' // 假设是管理员回复
      });
      
      // 关闭对话框
      replyDialogVisible.value = false;
    } catch (error) {
      // 错误已在 store 中处理
    }
  });
}

// 处理点赞评论
async function handleLikeComment(commentId, isLiked) {
  try {
    if (isLiked) {
      await commentStore.likeComment(commentId);
    } else {
      await commentStore.unlikeComment(commentId);
    }
  } catch (error) {
    // 错误已在 store 中处理
  }
}

// 处理删除评论
async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await commentStore.deleteComment(id);
    
    // 重新获取统计信息
    await commentStore.fetchCommentStats();
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在 store 中处理
    }
  }
}

// 处理批量删除
async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedComments.value.length} 条评论吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const ids = selectedComments.value.map(comment => comment.id);
    await commentStore.batchDeleteComments(ids);
    
    // 重新获取统计信息
    await commentStore.fetchCommentStats();
    
    // 清空选择
    selectedComments.value = [];
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在 store 中处理
    }
  }
}
</script>

<style scoped>
.comment-manage-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-card {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.stat-item {
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-item.total .stat-number {
  color: #606266;
}

.stat-item.approved .stat-number {
  color: #67c23a;
}

.stat-item.pending .stat-number {
  color: #e6a23c;
}

.stat-item.spam .stat-number {
  color: #f56c6c;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.search-filter {
  margin-bottom: 15px;
}

.action-buttons {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.action-buttons-mini {
  display: flex;
  gap: 5px;
}

.comment-content {
  position: relative;
  font-size: 14px;
}

.reply-indicator {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 5px;
}

.interaction-buttons {
  display: flex;
  gap: 5px;
}

.interaction-buttons .el-button {
  padding: 0 8px;
}

.interaction-buttons .el-button.liked {
  color: #f56c6c;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.article-link {
  color: #409eff;
  text-decoration: none;
  font-size: 13px;
}

.article-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.text-muted {
  color: #909399;
  font-size: 13px;
}

.reply-original-comment {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.reply-original-header {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #606266;
}

.reply-original-content {
  font-size: 13px;
  color: #606266;
  word-break: break-all;
}
</style>