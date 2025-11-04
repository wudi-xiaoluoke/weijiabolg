<template>
  <el-card class="comments-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>评论 ({{ commentStore.currentArticleComments.length || 0 }})</span>
      </div>
    </template>

    <!-- 评论输入框（登录后显示） -->
    <div class="comment-input-section" v-if="isAuthenticated">
      <el-avatar :size="40" :src="currentUser?.avatar || '/default-avatar.svg'" />
      <div class="comment-input-wrapper">
        <el-input
            v-model="commentText"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            maxlength="500"
            show-word-limit
        />
        <div class="comment-actions">
          <el-button
              type="primary"
              @click="submitComment"
              :disabled="!commentText.trim() || commentStore.loading"
          >
            发表评论
          </el-button>
        </div>
      </div>
    </div>
    <!-- 未登录提示 -->
    <el-empty description="请先登录后发表评论" v-else class="login-tip" />

    

    <!-- 评论列表 -->
    <div class="comments-list" v-if="commentStore.currentArticleComments.length > 0">
      <div
          v-for="comment in commentStore.currentArticleComments"
          :key="comment.id"
          class="comment-item"
      >
        <el-avatar :size="36" :src="comment.author?.avatar || '/default-avatar.svg'" />
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author?.username || '匿名用户' }}</span>
            <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
            <!-- 作者删除权限 -->
            <el-button
                size="mini"
                type="text"
                color="danger"
                @click="deleteComment(comment.id)"
                v-if="isAuthenticated && currentUser?.id === comment.author?.id"
            >
              删除
            </el-button>
          </div>
          <div class="comment-text">{{ comment.content }}</div>
          <div class="comment-footer">
            <span
                class="comment-action"
                @click="handleCommentLike(comment.id)"
                :class="{ active: comment.isLiked }"
                :loading="commentStore.likeLoading.get(comment.id)"
            >
              <el-icon><Star /></el-icon>
              {{ comment.likeCount || 0 }}
            </span>
            <span class="comment-action" @click="replyToComment(comment)">
              <el-icon><ChatDotRound /></el-icon>
              回复
            </span>
          </div>

          <!-- 回复列表 -->
          <div class="replies-list" v-if="comment.replies && comment.replies.length > 0">
            <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="reply-item"
            >
              <el-avatar :size="28" :src="reply.author?.avatar || '/default-avatar.svg'" />
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.author?.username || '匿名用户' }}</span>
                  <span class="reply-time">{{ formatDate(reply.createTime) }}</span>
                  <el-button
                      size="mini"
                      type="text"
                      color="danger"
                      @click="deleteComment(reply.id)"
                      v-if="isAuthenticated && currentUser?.id === reply.author?.id"
                  >
                    删除
                  </el-button>
                </div>
                <div class="reply-text">
                  <span v-if="reply.toAuthor" class="reply-to">@{{ reply.toAuthor }}：</span>
                  {{ reply.content }}
                </div>
                <div class="reply-footer">
                  <span
                      class="reply-action"
                      @click="handleCommentLike(reply.id)"
                      :class="{ active: reply.isLiked }"
                      :loading="commentStore.likeLoading.get(reply.id)"
                  >
                    <el-icon><Star /></el-icon>
                    {{ reply.likeCount || 0 }}
                  </span>
                  <span class="reply-action" @click="replyToComment(comment, reply)">
                    <el-icon><ChatDotRound /></el-icon>
                    回复
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 回复输入框 -->
          <div
              v-if="replyingTo === comment.id"
              class="reply-input-section"
          >
            <el-input
                v-model="replyText"
                type="textarea"
                :rows="2"
                :placeholder="replyToAuthor ? `回复 @${replyToAuthor}...` : '写下你的回复...'"
                maxlength="300"
                show-word-limit
            />
            <div class="reply-input-actions">
              <el-button size="small" @click="cancelReply">取消</el-button>
              <el-button size="small" type="primary" @click="submitReply" :disabled="!replyText.trim()">
                回复
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态/加载状态 -->
    <div v-else class="empty-comments" :loading="commentStore.loading">
      <el-empty description="暂无评论，快来抢沙发吧！" />
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="commentStore.totalComments > pageSize && !commentStore.loading">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          layout="total, prev, pager, next"
          :total="commentStore.totalComments || 0"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
      />
    </div>
  </el-card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Star, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useCommentStore } from '@/store/modules/comment'
import { useAuthStore } from '@/store/modules/auth'

// 接收父组件参数
const props = defineProps({
  articleId: {
    type: [Number, String], // 兼容数字/字符串类型
    required: true
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

// 状态管理
const commentStore = useCommentStore()
const authStore = useAuthStore()
const commentText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const replyingTo = ref(null) // 正在回复的评论ID
const replyText = ref('')
const replyToAuthor = ref('') // 被回复的用户名

// 计算属性：获取登录状态（优先使用authStore，其次使用props）
const isAuthenticated = computed(() => {
  // 优先使用authStore的状态，如果为false再检查props和localStorage
  return authStore.isAuthenticated || props.isAuthenticated || !!localStorage.getItem('token')
})

// 计算属性：获取用户信息
const currentUser = computed(() => {
  // 优先使用authStore的用户信息，如果不存在再尝试从props或localStorage获取
  if (authStore.user) return authStore.user
  if (props.user) return props.user
  // 尝试从localStorage获取用户信息
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e)
    return null
  }
})

// 监听文章ID变化，重新加载评论
watch(
    () => props.articleId,
    (newId) => {
      if (newId) {
        const articleIdNum = Number(newId) // 转为数字，适配后端参数类型
        currentPage.value = 1 // 重置页码
        commentStore.fetchArticleComments(articleIdNum, currentPage.value, pageSize.value)
      }
    },
    { immediate: true } // 组件挂载时立即执行
)

// 监听评论数据变化 - 已移除调试日志

/**
 * 格式化日期显示
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now - date
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}

/**
 * 发表评论
 */
const submitComment = async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录')
    return
  }
  const content = commentText.value.trim()
  if (!content) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  try {
    await commentStore.submitComment({
      articleId: Number(props.articleId),
      content,
      parentId: null // 顶级评论（无父评论）
    })
    // 重新加载评论列表
    commentStore.fetchArticleComments(Number(props.articleId), currentPage.value, pageSize.value)
    commentText.value = '' // 清空输入框
  } catch (error) {
    console.error('发表评论失败:', error)
  }
}

/**
 * 回复评论
 */
const replyToComment = (comment, reply = null) => {
  replyingTo.value = comment.id
  replyText.value = ''
  // 设置被回复的用户名
  if (reply) {
    replyToAuthor.value = reply.author?.username || '匿名用户'
  } else {
    replyToAuthor.value = comment.author?.username || '匿名用户'
  }
  // 滚动到输入框并聚焦
  setTimeout(() => {
    const textarea = document.querySelector('.reply-input-section textarea')
    textarea?.focus()
  }, 100)
}

/**
 * 提交回复
 */
const submitReply = async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录')
    return
  }
  const content = replyText.value.trim()
  if (!content) {
    ElMessage.warning('回复内容不能为空')
    return
  }

  try {
    await commentStore.submitComment({
      articleId: Number(props.articleId),
      content,
      parentId: replyingTo.value // 关联父评论ID
    })
    // 重新加载评论列表
    commentStore.fetchArticleComments(Number(props.articleId), currentPage.value, pageSize.value)
    cancelReply() // 清空回复状态
  } catch (error) {
    console.error('提交回复失败:', error)
  }
}

/**
 * 取消回复
 */
const cancelReply = () => {
  replyingTo.value = null
  replyText.value = ''
  replyToAuthor.value = ''
}

/**
 * 评论点赞
 */
const handleCommentLike = async (commentId) => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录')
    return
  }
  await commentStore.likeComment(commentId)
}

/**
 * 删除评论
 */
const deleteComment = async (commentId) => {
  await commentStore.deleteComment(commentId)
}

/**
 * 分页切换
 */
const handlePageChange = (val) => {
  currentPage.value = val
  commentStore.fetchArticleComments(Number(props.articleId), val, pageSize.value)
}

/**
 * 每页条数切换
 */
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  commentStore.fetchArticleComments(Number(props.articleId), 1, val)
}
</script>

<style scoped>
.comments-card {
  margin-top: 30px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
}

.comment-input-section {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--el-border-color-base);
  transition: flex-direction 0.3s ease;
}

.login-tip {
  text-align: center;
  padding: 20px 0;
}

.comment-input-wrapper {
  flex: 1;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
  transition: gap 0.3s ease;
}

.comment-item {
  display: flex;
  gap: 16px;
  transition: gap 0.3s ease;
}

.comment-content {
  flex: 1;
  padding: 8px 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.comment-author {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.comment-text {
  line-height: 1.6;
  color: var(--el-text-color-regular);
  margin-bottom: 12px;
  word-break: break-word;
  transition: font-size 0.3s ease;
}

.comment-footer {
  display: flex;
  gap: 20px;
  transition: gap 0.3s ease;
}

.comment-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px 8px;
  border-radius: 4px;
}

.comment-action:hover {
  color: var(--el-color-primary);
  background-color: var(--el-bg-color-hover);
}

.comment-action.active {
  color: var(--el-color-primary);
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  padding-left: 30px;
  transition: gap 0.3s ease, padding-left 0.3s ease;
}

.reply-item {
  display: flex;
  gap: 12px;
  transition: gap 0.3s ease;
}

.reply-content {
  flex: 1;
  background-color: var(--el-bg-color-light);
  border-radius: 8px;
  padding: 12px;
  transition: padding 0.3s ease;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 8px;
}

.reply-author {
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.reply-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.reply-text {
  line-height: 1.6;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
  font-size: 14px;
  word-break: break-word;
  transition: font-size 0.3s ease;
}

.reply-to {
  color: var(--el-color-primary);
}

.reply-footer {
  display: flex;
  gap: 16px;
  transition: gap 0.3s ease;
}

.reply-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px 8px;
  border-radius: 4px;
}

.reply-action:hover {
  color: var(--el-color-primary);
  background-color: var(--el-bg-color-hover);
}

.reply-action.active {
  color: var(--el-color-primary);
}

.reply-input-section {
  margin-top: 16px;
  padding-left: 30px;
  transition: padding-left 0.3s ease;
}

.reply-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
  transition: gap 0.3s ease;
}

.empty-comments {
  text-align: center;
  padding: 40px 0;
  transition: padding 0.3s ease;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  transition: margin-top 0.3s ease;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .comment-input-section {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 24px;
  }

  .comments-list {
    gap: 20px;
  }

  .comment-item {
    gap: 12px;
  }

  .comment-footer {
    gap: 16px;
  }

  .replies-list {
    gap: 16px;
    padding-left: 24px;
  }

  .reply-item {
    gap: 10px;
  }

  .reply-content {
    padding: 10px;
  }

  .reply-footer {
    gap: 12px;
  }

  .reply-input-section {
    padding-left: 24px;
  }

  .pagination-container {
    justify-content: center;
    margin-top: 24px;
  }
}

@media (max-width: 480px) {
  .comments-card {
    margin-top: 20px;
  }

  .comment-input-section {
    margin-bottom: 20px;
    padding-bottom: 20px;
  }

  .comment-text {
    font-size: 14px;
  }

  .comment-footer {
    gap: 12px;
  }

  .comment-action {
    font-size: 13px;
  }

  .replies-list {
    gap: 12px;
    padding-left: 16px;
    margin-top: 12px;
  }

  .reply-item {
    gap: 8px;
  }

  .reply-content {
    padding: 8px;
  }

  .reply-text {
    font-size: 13px;
  }

  .reply-footer {
    gap: 10px;
  }

  .reply-action {
    font-size: 11px;
  }

  .reply-input-section {
    padding-left: 16px;
    margin-top: 12px;
  }

  .reply-input-actions {
    gap: 8px;
  }

  .empty-comments {
    padding: 30px 0;
  }

  .pagination-container {
    margin-top: 20px;
  }
}

/* 暗黑主题适配 */
:deep(.el-card__body) {
  background-color: var(--el-bg-color-white);
  transition: background-color 0.3s ease;
}

/* 文本选择体验优化 */
.comment-text, .reply-text {
  user-select: text;
  -webkit-user-select: text;
}
</style>