<template>
  <el-card class="comments-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>评论 ({{ comments.length }})</span>
      </div>
    </template>
    
    <!-- 评论输入框 -->
    <div class="comment-input-section">
      <el-avatar :size="40" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
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
          <el-button type="primary" @click="submitComment" :disabled="!commentText.trim()">
            发表评论
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 评论列表 -->
    <div class="comments-list" v-if="comments.length > 0">
      <div 
        v-for="comment in paginatedComments" 
        :key="comment.id" 
        class="comment-item"
      >
        <el-avatar :size="36" :src="comment.avatar" />
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-time">{{ formatDate(comment.time) }}</span>
          </div>
          <div class="comment-text">{{ comment.text }}</div>
          <div class="comment-footer">
            <span 
              class="comment-action" 
              @click="toggleLike(comment.id)"
              :class="{ active: comment.liked }"
            >
              <el-icon><Star /></el-icon>
              {{ comment.likes }}
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
              <el-avatar :size="28" :src="reply.avatar" />
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.author }}</span>
                  <span class="reply-time">{{ formatDate(reply.time) }}</span>
                </div>
                <div class="reply-text">
                  <span v-if="reply.to" class="reply-to">@{{ reply.to }}：</span>
                  {{ reply.text }}
                </div>
                <div class="reply-footer">
                  <span 
                    class="reply-action" 
                    @click="toggleReplyLike(comment.id, reply.id)"
                    :class="{ active: reply.liked }"
                  >
                    <el-icon><Star /></el-icon>
                    {{ reply.likes }}
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
              :placeholder="replyTo ? `回复 @${replyTo}...` : '写下你的回复...'"
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
    
    <!-- 空状态 -->
    <div v-else class="empty-comments">
      <el-empty description="暂无评论，快来抢沙发吧！" />
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container" v-if="comments.length > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        layout="total, prev, pager, next"
        :total="comments.length"
        @current-change="handlePageChange"
      />
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Star, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  articleId: {
    type: Number,
    required: true
  }
})

// 状态管理
const comments = ref([])
const commentText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const replyingTo = ref(null)
const replyText = ref('')
const replyTo = ref(null)

// 计算分页后的评论
const paginatedComments = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return comments.value.slice(start, end)
})

// 模拟评论数据
const mockComments = [
  {
    id: 1,
    author: '前端小白',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    text: '文章写得很棒！我一直在学习Vue 3，这篇文章对我帮助很大。',
    time: '2024-01-16T10:30:00',
    likes: 12,
    liked: false,
    replies: [
      {
        id: 101,
        author: '技术博主',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        text: '谢谢支持！有任何问题都可以在评论区讨论。',
        time: '2024-01-16T11:00:00',
        likes: 5,
        liked: false
      },
      {
        id: 102,
        author: 'Vue爱好者',
        avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
        text: '组合式API确实比选项式API更灵活，特别是对于复杂组件。',
        time: '2024-01-16T12:30:00',
        likes: 3,
        liked: false
      }
    ]
  },
  {
    id: 2,
    author: '全栈开发者',
    avatar: 'https://cube.elemecdn.com/1/8e/aeffeb4de29c3e709e4afcc31bfda6png.png',
    text: '我想知道在实际项目中如何处理组合式API中的异步操作？有什么最佳实践吗？',
    time: '2024-01-16T14:20:00',
    likes: 8,
    liked: false,
    replies: []
  },
  {
    id: 3,
    author: '新手程序员',
    avatar: 'https://cube.elemecdn.com/2/11/6535bcfb26e4c79b48dd004b04983apng.png',
    text: '感谢分享！我是Vue的初学者，这篇文章让我对Vue 3有了更清晰的认识。',
    time: '2024-01-16T16:45:00',
    likes: 6,
    liked: false,
    replies: [
      {
        id: 301,
        author: '技术博主',
        avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
        to: '新手程序员',
        text: '加油学习！Vue是一个很棒的前端框架，上手容易但深度也足够。',
        time: '2024-01-16T17:00:00',
        likes: 4,
        liked: false
      }
    ]
  }
]

// 生命周期钩子
onMounted(() => {
  // 这里应该调用API获取真实评论数据
  // 暂时使用模拟数据
  comments.value = mockComments
})

// 方法
const submitComment = () => {
  if (!commentText.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  
  // 这里应该调用API提交评论
  const newComment = {
    id: Date.now(),
    author: '当前用户',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    text: commentText.value.trim(),
    time: new Date().toISOString(),
    likes: 0,
    liked: false,
    replies: []
  }
  
  comments.value.unshift(newComment)
  commentText.value = ''
  ElMessage.success('评论发表成功')
}

const replyToComment = (comment, reply = null) => {
  replyingTo.value = comment.id
  replyText.value = ''
  replyTo.value = reply ? reply.author : null
}

const submitReply = () => {
  if (!replyText.value.trim()) {
    ElMessage.warning('回复内容不能为空')
    return
  }
  
  // 这里应该调用API提交回复
  const comment = comments.value.find(c => c.id === replyingTo.value)
  if (comment) {
    const newReply = {
      id: Date.now(),
      author: '当前用户',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      text: replyText.value.trim(),
      time: new Date().toISOString(),
      likes: 0,
      liked: false
    }
    
    if (replyTo.value) {
      newReply.to = replyTo.value
    }
    
    if (!comment.replies) {
      comment.replies = []
    }
    
    comment.replies.push(newReply)
    cancelReply()
    ElMessage.success('回复发表成功')
  }
}

const cancelReply = () => {
  replyingTo.value = null
  replyText.value = ''
  replyTo.value = null
}

const toggleLike = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    if (comment.liked) {
      comment.likes--
    } else {
      comment.likes++
    }
    comment.liked = !comment.liked
  }
}

const toggleReplyLike = (commentId, replyId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment && comment.replies) {
    const reply = comment.replies.find(r => r.id === replyId)
    if (reply) {
      if (reply.liked) {
        reply.likes--
      } else {
        reply.likes++
      }
      reply.liked = !reply.liked
    }
  }
}

const handlePageChange = (current) => {
  currentPage.value = current
}

const formatDate = (dateString) => {
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
}

.comment-input-section {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--border-color-base, #ebeef5);
  transition: flex-direction 0.3s ease;
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
  transition: gap 0.3s ease;
}

.comment-item {
  display: flex;
  gap: 16px;
  transition: gap 0.3s ease;
}

.comment-content {
  flex: 1;
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
  min-height: 40px;
  padding: 4px 8px;
  border-radius: 4px;
}

.comment-action:hover {
  color: var(--el-color-primary);
  background-color: var(--bg-color-hover, #f5f7fa);
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
  background-color: var(--bg-color-light, #f5f7fa);
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
  min-height: 36px;
  padding: 4px 8px;
  border-radius: 4px;
}

.reply-action:hover {
  color: var(--el-color-primary);
  background-color: var(--bg-color-hover, #f0f0f0);
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

/* 响应式设计增强 */
@media (max-width: 1024px) {
  .comments-card {
    margin-top: 24px;
  }
}

@media (max-width: 768px) {
  .comment-input-section {
    flex-direction: column;
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
  
  /* 优化移动端按钮触摸目标 */
  .el-button {
    min-height: 36px;
    min-width: 44px;
    font-size: 13px;
  }
  
  /* 优化输入框在移动端的显示 */
  .el-input__inner {
    font-size: 14px;
    padding: 8px 12px;
  }
}

/* 确保在暗黑主题下的良好显示 */
:deep(.el-card__body) {
  background-color: var(--bg-color-white, #ffffff);
  transition: background-color 0.3s ease;
}

/* 优化文本选择体验 */
.comment-text,
.reply-text {
  user-select: text;
  -webkit-user-select: text;
}
</style>