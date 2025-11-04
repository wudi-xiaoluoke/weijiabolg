<template>
  <div class="article-comments">
    <!-- 评论头部：标题和排序 -->
    <div class="comments-header">
      <div class="comments-title-section">
        <h3 class="comments-title">评论</h3>
        <span class="comments-count">({{ commentStore.totalComments || 0 }})</span>
      </div>
      <div class="comments-sort">
        <el-button 
          size="small" 
          :type="sortBy === 'hot' ? 'primary' : 'default'" 
          @click="sortComments('hot')"
          plain
        >
          最热
        </el-button>
        <el-button 
          size="small" 
          :type="sortBy === 'newest' ? 'primary' : 'default'" 
          @click="sortComments('newest')"
          plain
        >
          最新
        </el-button>
      </div>
    </div>
    
    <!-- 评论输入框 -->
    <div class="comment-input-section">
      <!-- 临时修改：强制显示评论输入框，不检查登录状态 -->
      <div v-if="false" class="login-prompt">
        <el-empty 
          description="请先登录后发表评论" 
          :image-size="100"
        >
          <el-button type="primary" @click="toLogin">去登录</el-button>
        </el-empty>
      </div>
      <div v-else class="comment-form-wrapper">
        <el-avatar 
          :size="48" 
          :src="user?.avatar || '/default-avatar.svg'" 
          class="user-avatar"
        />
        <div class="comment-form">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            maxlength="500"
            show-word-limit
            class="comment-textarea"
            @keydown.enter.ctrl="handleSubmitComment"
          />
          <div class="comment-actions">
            <el-button 
              type="primary" 
              @click="handleSubmitComment"
              :loading="commentStore.commentSubmitting"
              :disabled="!commentContent.trim() || commentStore.commentSubmitting"
            >
              发表评论
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 评论列表 -->
    <div class="comments-list">
      <!-- 加载状态 -->
      <el-skeleton 
        v-if="commentStore.commentsLoading && commentStore.currentArticleComments.length === 0"
        :rows="3" 
        animated 
        class="loading-skeleton"
      />
      
      <!-- 错误提示 -->
      <el-alert
        v-else-if="commentStore.commentsError"
        title="加载评论失败"
        type="error"
        description="请检查网络连接后重试"
        show-icon
        :closable="false"
        class="error-alert"
      >
        <template #footer>
          <el-button size="small" type="primary" @click="refreshComments">重试</el-button>
        </template>
      </el-alert>
      
      <!-- 空状态 -->
      <el-empty
        v-else-if="commentStore.currentArticleComments.length === 0 && !commentStore.commentsLoading"
        description="暂无评论，快来发表第一条评论吧！"
        :image-size="120"
        class="empty-comments"
      >
        <el-button 
          v-if="isAuthenticated" 
          type="primary" 
          @click="focusCommentInput"
        >
          发表第一条评论
        </el-button>
      </el-empty>
      
      <!-- 评论列表 -->
      <el-collapse-transition>
        <CommentItem 
          v-for="comment in commentStore.currentArticleComments" 
          :key="comment.id"
          :comment="comment"
          :current-user-id="user?.id"
          :is-authenticated="isAuthenticated"
          @reply="handleReply"
          @like="handleCommentLike"
          @delete="handleCommentDelete"
          class="comment-item"
        />
      </el-collapse-transition>
      
      <!-- 加载更多按钮 -->
      <div v-if="commentStore.hasMoreComments" class="load-more">
        <el-button 
          type="primary" 
          plain
          @click="loadMoreComments" 
          :loading="commentStore.commentsLoading"
          :disabled="commentStore.commentsLoading"
          size="small"
          style="width: 100%;"
        >
          {{ commentStore.commentsLoading ? '加载中...' : '加载更多评论' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CommentItem from './CommentItem.vue'
import { useCommentStore } from '../../store/modules/comment'
import { useAuthStore } from '../../store/modules/auth'

const props = defineProps({
  articleId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['comment-added', 'comment-deleted'])

const router = useRouter()
const commentStore = useCommentStore()
const authStore = useAuthStore()

// 响应式数据
const commentContent = ref('')
const sortBy = ref('hot') // 'hot' | 'newest'
const pageSize = 10

// 计算属性 - 添加更健壮的登录状态判断
const isAuthenticated = computed(() => {
  // 添加调试信息
  console.log('Auth状态检查:', {
    authStoreIsAuthenticated: authStore.isAuthenticated,
    hasUser: !!authStore.user,
    hasToken: !!localStorage.getItem('token')
  })
  // 使用更宽松的登录状态判断，只要有token就认为已登录
  return authStore.isAuthenticated || !!localStorage.getItem('token')
})

const user = computed(() => {
  if (authStore.user) return authStore.user
  // 如果store中没有用户信息，尝试从localStorage获取
  try {
    const storedUser = localStorage.getItem('userInfo') || localStorage.getItem('user')
    if (storedUser) {
      return JSON.parse(storedUser)
    }
  } catch (e) {
    console.error('解析用户信息失败:', e)
  }
  return null
})

// 获取评论列表
const fetchComments = async (page = 1) => {
  try {
    await commentStore.fetchArticleComments(props.articleId, page, pageSize, sortBy.value)
  } catch (err) {
    console.error('获取评论失败:', err)
    ElMessage.error('加载评论失败，请稍后重试')
  }
}

// 加载更多评论
const loadMoreComments = async () => {
  if (commentStore.commentsLoading) return
  try {
    await commentStore.loadMoreComments(props.articleId, sortBy.value)
  } catch (err) {
    console.error('加载更多评论失败:', err)
    ElMessage.error('加载更多评论失败')
  }
}

// 刷新评论
const refreshComments = async () => {
  try {
    await commentStore.fetchArticleComments(props.articleId, 1, pageSize, sortBy.value)
  } catch (err) {
    console.error('刷新评论失败:', err)
  }
}

// 切换排序方式
const sortComments = async (sortType) => {
  if (sortBy.value === sortType) return
  sortBy.value = sortType
  await fetchComments(1)
}

// 提交评论
const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  if (!isAuthenticated.value) {
    toLogin()
    return
  }
  
  try {
    // 使用commentStore提交评论
    const newComment = await commentStore.submitComment({
      articleId: props.articleId,
      content: commentContent.value.trim()
    })
    
    // 清空输入框
    commentContent.value = ''
    
    // 重新获取评论列表以显示最新评论
    await fetchComments(1)
    
    ElMessage.success('评论发表成功')
    
    // 触发评论添加事件，通知父组件更新评论数
    emit('comment-added', newComment)
    
    // 滚动到评论区域顶部
    nextTick(() => {
      const commentSection = document.querySelector('.comments-list')
      if (commentSection) {
        commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败，请稍后重试')
  }
}

// 处理回复
const handleReply = async (commentId, content, targetUser = null) => {
  if (!isAuthenticated.value) {
    toLogin()
    return
  }
  
  try {
    await commentStore.submitComment({
      articleId: props.articleId,
      content: content,
      parentId: commentId,
      targetUserId: targetUser?.id
    })
    
    ElMessage.success('回复发表成功')
    // 重新获取评论以显示最新回复
    await fetchComments(1)
  } catch (error) {
    console.error('发表回复失败:', error)
    ElMessage.error('回复失败，请稍后重试')
  }
}

// 处理评论点赞
const handleCommentLike = async (commentId) => {
  if (!isAuthenticated.value) {
    toLogin()
    return
  }
  
  try {
    await commentStore.likeComment(commentId)
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 处理评论删除
const handleCommentDelete = async (commentId) => {
  try {
    await commentStore.deleteComment(commentId)
    ElMessage.success('删除成功')
    emit('comment-deleted', commentId)
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败，请稍后重试')
  }
}

// 跳转到登录页面
const toLogin = () => {
  router.push('/login')
}

// 聚焦评论输入框
const focusCommentInput = () => {
  nextTick(() => {
    const textarea = document.querySelector('.comment-textarea textarea')
    if (textarea) {
      textarea.focus()
      // 滚动到输入框位置
      const inputSection = document.querySelector('.comment-input-section')
      if (inputSection) {
        inputSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  })
}

// 监听文章ID变化，重新获取评论
watch(() => props.articleId, (newArticleId) => {
  if (newArticleId) {
    fetchComments(1)
  }
}, { immediate: true })

// 监听登录状态变化，重新获取评论以更新点赞状态
watch(isAuthenticated, (newVal) => {
  if (newVal && props.articleId) {
    fetchComments(1)
  }
})

// 组件挂载时获取评论
onMounted(() => {
  if (props.articleId) {
    fetchComments(1)
  }
})
</script>

<style scoped>
.article-comments {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.comments-title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comments-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.comments-count {
  font-size: 1rem;
  color: #909399;
  font-weight: normal;
}

.comments-sort {
  display: flex;
  gap: 0.5rem;
}

.comment-input-section {
  margin-bottom: 2rem;
  animation: fadeIn 0.3s ease;
}

.comment-form-wrapper {
  display: flex;
  gap: 1rem;
}

.user-avatar {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.comment-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.5s ease;
}

.comment-item {
  animation: fadeInUp 0.5s ease;
}

.load-more {
  margin-top: 1.5rem;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Element Plus 样式覆盖 */
.comment-textarea :deep(.el-textarea__inner) {
  border-radius: 6px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.comment-textarea :deep(.el-textarea__inner:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.login-prompt :deep(.el-empty__image) {
  width: 100px !important;
  height: 100px !important;
}

.empty-comments :deep(.el-empty__image) {
  width: 120px !important;
  height: 120px !important;
}

.loading-skeleton {
  margin-bottom: 1rem;
  border-radius: 4px;
  overflow: hidden;
}

.error-alert {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗黑模式支持 */
:global(.dark) .article-comments {
  background-color: #1e1e1e;
  color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:global(.dark) .comments-title {
  color: #e0e0e0;
}

:global(.dark) .comments-count {
  color: #909399;
}

:global(.dark) .comment-textarea :deep(.el-textarea__inner) {
  background-color: #2c2c2c;
  border-color: #444;
  color: #e0e0e0;
}

:global(.dark) .comment-textarea :deep(.el-textarea__inner:focus) {
  border-color: #66b1ff;
  box-shadow: 0 0 0 2px rgba(102, 177, 255, 0.2);
}

:global(.dark) .login-prompt :deep(.el-empty__description) {
  color: #909399;
}

:global(.dark) .empty-comments :deep(.el-empty__description) {
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-comments {
    padding: 1rem;
    margin-top: 1.5rem;
  }
  
  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .comments-title {
    font-size: 1.25rem;
  }
  
  .comment-form-wrapper {
    gap: 0.75rem;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .comments-list {
    gap: 1rem;
  }
  
  .comment-item {
    animation: fadeInUp 0.3s ease;
  }
  
  .loading-skeleton {
    margin-bottom: 0.75rem;
  }
}

/* 滚动条美化 */
.comments-list::-webkit-scrollbar {
  width: 4px;
}

.comments-list::-webkit-scrollbar-track {
  background: transparent;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

:global(.dark) .comments-list::-webkit-scrollbar-thumb {
  background: #555;
}

:global(.dark) .comments-list::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>