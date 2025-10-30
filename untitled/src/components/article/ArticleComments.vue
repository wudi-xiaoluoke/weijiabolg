<template>
  <div class="article-comments">
    <h3 class="comments-title">评论 ({{ commentStore.totalComments }})</h3>
    
    <!-- 评论输入框 -->
    <div class="comment-input-section">
      <div v-if="!isAuthenticated" class="login-prompt">
        <p>请先 <a href="#login" @click.prevent="toLogin">登录</a> 后再发表评论</p>
      </div>
      <div v-else class="comment-form">
        <textarea 
          v-model="commentContent" 
          placeholder="写下你的评论..."
          rows="4"
          class="comment-textarea"
        ></textarea>
        <div class="comment-actions">
          <button 
            @click="handleSubmitComment" 
            class="submit-btn"
            :disabled="!commentContent.trim() || commentStore.commentSubmitting"
          >
            {{ commentStore.commentSubmitting ? '提交中...' : '发表评论' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 评论列表 -->
    <div class="comments-list">
      <CommentItem 
        v-for="comment in commentStore.currentArticleComments" 
        :key="comment.id"
        :comment="comment"
        :current-user-id="user?.id"
        :is-authenticated="isAuthenticated"
        @reply="handleReply"
        @like="handleCommentLike"
        @delete="handleCommentDelete"
      />
      
      <!-- 加载更多按钮 -->
      <div v-if="commentStore.hasMoreComments" class="load-more">
        <button @click="loadMoreComments" :disabled="commentStore.commentsLoading">
          {{ commentStore.commentsLoading ? '加载中...' : '加载更多评论' }}
        </button>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="commentStore.commentsLoading && commentStore.currentArticleComments.length === 0" class="loading-comments">
        <p>加载评论中...</p>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="commentStore.commentsError" class="error-comments">
        <p>{{ commentStore.commentsError }}</p>
        <button @click="refreshComments">重试</button>
      </div>
      
      <!-- 空状态 -->
      <div v-if="commentStore.currentArticleComments.length === 0 && !commentStore.commentsLoading" class="empty-comments">
        <p>暂无评论，快来发表第一条评论吧！</p>
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
const isSubmitting = ref(false)
const currentPage = ref(1)
const pageSize = 10

// 计算属性
const isLoggedIn = computed(() => authStore.isAuthenticated)
const currentUserId = computed(() => authStore.user?.id || '')
const comments = computed(() => commentStore.getCommentsByArticle(props.articleId))
const totalComments = computed(() => commentStore.getTotalCountByArticle(props.articleId))
const isLoading = computed(() => commentStore.loading)
const error = computed(() => commentStore.error)

// 获取评论列表
const fetchComments = async (page = 1) => {
  try {
    await commentStore.fetchComments(props.articleId, page, pageSize)
  } catch (err) {
    console.error('获取评论失败:', err)
  }
}

// 提交评论
const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  if (!isLoggedIn.value) {
    toLogin()
    return
  }
  
  isSubmitting.value = true
  try {
    const newComment = await commentStore.createComment(props.articleId, commentContent.value.trim())
    // 清空输入框
    commentContent.value = ''
    // 重置到第一页，显示最新评论
    currentPage.value = 1
    // 重新获取评论列表
    await fetchComments(1)
    ElMessage.success('评论发表成功')
    
    // 触发评论添加事件，通知父组件更新评论数
    emit('comment-added', newComment)
    
    // 滚动到评论区域顶部
    nextTick(() => {
      const commentSection = document.querySelector('.comment-list')
      if (commentSection) {
        commentSection.scrollIntoView({ behavior: 'smooth' })
      }
    })
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 处理评论回复
const handleReply = async (commentId, content, isLoginRequired = false) => {
  if (isLoginRequired) {
    toLogin()
    return
  }
  
  try {
    await commentStore.replyToComment(commentId, content)
    // 重新获取评论列表以更新回复
    await fetchComments(currentPage.value)
    ElMessage.success('回复成功')
  } catch (error) {
    console.error('回复评论失败:', error)
    ElMessage.error('回复失败，请稍后重试')
  }
}

// 点赞评论
const handleCommentLike = async (commentId, isLiked, isLoginRequired = false) => {
  if (isLoginRequired || !isLoggedIn.value) {
    toLogin()
    return
  }
  
  try {
    await commentStore.toggleCommentLike(commentId)
  } catch (error) {
    console.error('评论点赞失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 处理评论删除
const handleCommentDelete = async (commentId) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    await commentStore.deleteComment(commentId)
    // 重新获取评论列表
    await fetchComments(currentPage.value)
    ElMessage.success('评论删除成功')
    
    // 触发评论删除事件，通知父组件更新评论数
    emit('comment-deleted', commentId)
  } catch (error) {
    console.error('删除评论失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}

// 加载更多评论
const loadMoreComments = async () => {
  currentPage.value++
  await fetchComments(currentPage.value)
}

// 刷新评论
const refreshComments = async () => {
  currentPage.value = 1
  await fetchComments(1)
}

// 跳转到登录页
const toLogin = () => {
  const currentPath = encodeURIComponent(window.location.pathname)
  router.push(`/login?redirect=${currentPath}`)
}

// 切换页码
const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchComments(page)
  
  // 滚动到评论区域
  nextTick(() => {
    const commentSection = document.querySelector('.comment-list')
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

// 监听文章ID变化，重新获取评论
watch(() => props.articleId, (newId) => {
  if (newId) {
    currentPage.value = 1
    fetchComments(1)
  }
}, { immediate: true })

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

.comments-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.comment-input-section {
  margin-bottom: 2rem;
}

.login-prompt {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  text-align: center;
  color: #666;
  transition: all 0.3s ease;
}

.login-prompt a {
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.login-prompt a:hover {
  text-decoration: underline;
  color: #0056b3;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  outline: none;
}

.comment-textarea:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  padding: 0.5rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.load-more button {
  padding: 0.5rem 1.5rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.load-more button:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #007bff;
  color: #007bff;
}

.load-more button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-comments {
  text-align: center;
  padding: 2rem;
  color: #666;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.error-comments {
  text-align: center;
  padding: 1.5rem;
  color: #dc3545;
  background-color: #f8d7da;
  border-radius: 6px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.error-comments button {
  margin-top: 0.5rem;
  padding: 0.375rem 0.75rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.error-comments button:hover {
  background-color: #c82333;
}

.empty-comments {
  text-align: center;
  padding: 2rem;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 6px;
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

:global(.dark) .login-prompt {
  background-color: #2c2c2c;
  color: #999;
}

:global(.dark) .login-prompt a {
  color: #66b1ff;
}

:global(.dark) .login-prompt a:hover {
  color: #99c1ff;
}

:global(.dark) .comment-textarea {
  background-color: #2c2c2c;
  border-color: #444;
  color: #e0e0e0;
}

:global(.dark) .comment-textarea:focus {
  border-color: #66b1ff;
  box-shadow: 0 0 0 2px rgba(102, 177, 255, 0.2);
}

:global(.dark) .submit-btn {
  background-color: #007bff;
}

:global(.dark) .submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

:global(.dark) .load-more button {
  background-color: #2c2c2c;
  border-color: #444;
  color: #e0e0e0;
}

:global(.dark) .load-more button:hover:not(:disabled) {
  background-color: #3a3a3a;
  border-color: #66b1ff;
  color: #66b1ff;
}

:global(.dark) .loading-comments {
  color: #999;
}

:global(.dark) .error-comments {
  background-color: #3a1a1a;
  border: 1px solid #663333;
  color: #ff9999;
}

:global(.dark) .error-comments button {
  background-color: #663333;
  color: #ff9999;
}

:global(.dark) .error-comments button:hover {
  background-color: #774444;
}

:global(.dark) .empty-comments {
  background-color: #2c2c2c;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-comments {
    padding: 1rem;
    margin-top: 1.5rem;
  }
  
  .comments-title {
    font-size: 1.25rem;
  }
  
  .comment-textarea {
    font-size: 0.9rem;
    padding: 0.6rem;
  }
  
  .submit-btn,
  .load-more button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .comments-list {
    gap: 1rem;
  }
  
  .error-comments,
  .empty-comments,
  .loading-comments {
    padding: 1.5rem;
  }
}

/* 动画效果提升用户体验 */
.comment-appear {
  animation: fadeInUp 0.5s ease;
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
</style>