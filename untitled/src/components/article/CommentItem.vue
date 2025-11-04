<template>
  <div class="comment-item comment-appear">
    <!-- 评论者头像 -->
    <el-avatar 
      :size="48" 
      :src="comment.author?.avatar || '/default-avatar.svg'" 
      class="comment-avatar"
      @click="goToUserProfile(comment.author?.id)"
    />
    
    <div class="comment-content">
      <!-- 评论头部：用户名、时间、删除按钮 -->
      <div class="comment-header">
        <el-link 
          :underline="false" 
          class="comment-author"
          @click="goToUserProfile(comment.author?.id)"
        >
          {{ comment.author?.username || comment.author?.name || '匿名用户' }}
        </el-link>
        <span class="comment-time">{{ formatCommentTime(comment.createTime || comment.createdAt) }}</span>
        
        <!-- 只有评论作者才能删除评论 -->
        <el-popconfirm
          v-if="isAuthor"
          title="确定要删除这条评论吗？"
          @confirm="handleDelete"
          confirm-button-text="确定"
          cancel-button-text="取消"
          placement="top"
        >
          <template #reference>
            <el-button 
              type="text" 
              size="small" 
              class="comment-delete-btn"
              icon="el-icon-delete"
            >
              删除
            </el-button>
          </template>
        </el-popconfirm>
      </div>
      
      <!-- 评论内容 -->
      <div class="comment-text">{{ comment.content }}</div>
      
      <!-- 评论底部操作：点赞、回复 -->
      <div class="comment-footer">
        <el-button 
          type="text" 
          size="small" 
          class="action-button"
          :class="{ 'liked': isCommentLiked }"
          icon="el-icon-thumb"
          @click="handleLike"
          :loading="isLiking"
          :disabled="!isAuthenticated"
        >
          <span>{{ commentLikeCount }}</span>
        </el-button>
        
        <el-button 
          type="text" 
          size="small" 
          class="action-button"
          icon="el-icon-chat-dot-round"
          @click="handleReply"
        >
          回复
        </el-button>
      </div>
      
      <!-- 回复列表 -->
      <el-collapse-transition>
        <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
          <div 
            v-for="reply in comment.replies" 
            :key="reply.id" 
            class="reply-item"
          >
            <div class="reply-header">
              <el-link 
                :underline="false" 
                class="reply-author"
                @click="goToUserProfile(reply.author?.id)"
              >
                {{ reply.author?.username || reply.author?.name || '匿名用户' }}
              </el-link>
              
              <span v-if="reply.targetAuthor" class="reply-to">
                回复
                <el-link :underline="false" class="reply-target">
                  @{{ reply.targetAuthor?.username || reply.targetAuthor?.name || '匿名用户' }}
                </el-link>
              </span>
              
              <el-popconfirm
                v-if="isReplyAuthor(reply)"
                title="确定要删除这条回复吗？"
                @confirm="handleReplyDelete(reply.id)"
                confirm-button-text="确定"
                cancel-button-text="取消"
                placement="top"
              >
                <template #reference>
                  <el-button 
                    type="text" 
                    size="small" 
                    class="reply-delete-btn"
                    icon="el-icon-delete"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
            
            <div class="reply-content">{{ reply.content }}</div>
            
            <div class="reply-footer">
              <span class="reply-time">{{ formatCommentTime(reply.createTime || reply.createdAt) }}</span>
              
              <el-button 
                type="text" 
                size="small" 
                class="reply-action"
                :class="{ 'liked': isReplyLiked(reply.id) }"
                icon="el-icon-thumb"
                @click="handleReplyLike(reply)"
                :loading="isLiking"
                :disabled="!isAuthenticated"
              >
                <span>{{ reply.likes || reply.likeCount || 0 }}</span>
              </el-button>
              
              <el-button 
                type="text" 
                size="small" 
                class="reply-action"
                icon="el-icon-chat-dot-round"
                @click="handleReplyToReply(reply)"
              >
                回复
              </el-button>
            </div>
          </div>
        </div>
      </el-collapse-transition>
      
      <!-- 回复输入框 -->
      <el-collapse-transition>
        <div v-if="isReplying" class="reply-input-section">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="2"
            placeholder="写下你的回复..."
            maxlength="300"
            show-word-limit
            class="reply-textarea"
          />
          <div class="reply-input-actions">
            <el-button 
              @click="cancelReply" 
              size="small"
              :loading="submittingReply"
            >
              取消
            </el-button>
            <el-button 
              type="primary" 
              @click="submitReply"
              size="small"
              :loading="submittingReply"
              :disabled="!replyContent.trim() || submittingReply"
            >
              回复
            </el-button>
          </div>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElPopconfirm } from 'element-plus'
import { useCommentStore } from '../../store/modules/comment'
import { useSocialStore } from '../../store/modules/social'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  currentUserId: {
    type: String,
    default: ''
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['reply', 'like', 'delete'])

// 使用store
const commentStore = useCommentStore()
const socialStore = useSocialStore()
const router = useRouter()

// 响应式数据
const isReplying = ref(false)
const replyContent = ref('')
const submittingReply = ref(false)
const isLiking = ref(false)
const replyTarget = ref(null)

// 计算属性 - 从comment store获取评论点赞状态
const isCommentLiked = computed(() => {
  return commentStore.isCommentLiked?.(props.comment.id) || props.comment.isLiked || false
})

// 从comment props获取评论点赞数，优先使用后端返回的likes字段
const commentLikeCount = computed(() => {
  return props.comment.likes || props.comment.likeCount || 0
})

// 判断是否是评论作者
const isAuthor = computed(() => {
  return props.currentUserId && 
         (props.comment.userId === props.currentUserId || 
          props.comment.author?.id === props.currentUserId)
})

// 判断回复是否是作者
const isReplyAuthor = (reply) => {
  return props.currentUserId && 
         (reply.userId === props.currentUserId || 
          reply.author?.id === props.currentUserId)
}

// 格式化评论时间
const formatCommentTime = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  }
  
  // 小于24小时
  if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  }
  
  // 小于7天
  if (diff < 7 * 86400000) {
    return Math.floor(diff / 86400000) + '天前'
  }
  
  // 其他
  return date.toLocaleDateString('zh-CN')
}

// 处理点赞
const handleLike = async () => {
  if (!props.isAuthenticated) {
    ElMessage.warning('请先登录后点赞')
    emit('like', props.comment.id)
    return
  }
  
  isLiking.value = true
  try {
    // 使用comment store处理评论点赞
    await commentStore.likeComment(props.comment.id)
    emit('like', props.comment.id)
    
    // 静默操作，不显示提示
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    isLiking.value = false
  }
}

// 处理回复
const handleReply = () => {
  if (!props.isAuthenticated) {
    ElMessage.warning('请先登录后回复')
    emit('reply', props.comment.id)
    return
  }
  
  isReplying.value = true
  replyContent.value = ''
  replyTarget.value = null
  
  // 滚动到回复框
  setTimeout(() => {
    const replyInput = document.querySelector(`.reply-input-section`)
    if (replyInput) {
      replyInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

// 取消回复
const cancelReply = () => {
  isReplying.value = false
  replyContent.value = ''
  replyTarget.value = null
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  submittingReply.value = true
  try {
    // 触发父组件的回复提交
    await emit('reply', props.comment.id, replyContent.value.trim(), replyTarget.value)
    
    // 清空输入
    replyContent.value = ''
    isReplying.value = false
    replyTarget.value = null
  } catch (error) {
    console.error('发表回复失败:', error)
    ElMessage.error('回复失败，请稍后重试')
  } finally {
    submittingReply.value = false
  }
}

// 判断回复是否已点赞
const isReplyLiked = (replyId) => {
  return commentStore.isCommentLiked?.(replyId) || false
}

// 处理回复点赞
const handleReplyLike = async (reply) => {
  if (!props.isAuthenticated) {
    ElMessage.warning('请先登录后点赞')
    emit('like', reply.id)
    return
  }
  
  isLiking.value = true
  try {
    // 使用comment store处理回复点赞
    await commentStore.likeComment(reply.id)
    emit('like', reply.id)
    
    // 静默操作，不显示提示
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    isLiking.value = false
  }
}

// 处理回复的回复
const handleReplyToReply = (reply) => {
  if (!props.isAuthenticated) {
    ElMessage.warning('请先登录后回复')
    emit('reply', props.comment.id)
    return
  }
  
  isReplying.value = true
  replyTarget.value = {
    id: reply.userId || reply.author?.id,
    name: reply.author?.username || reply.author?.name || '匿名用户'
  }
  
  // 如果回复中有@，先移除它，再添加新的@
  const contentWithoutAt = replyContent.value.replace(/^@[^\s]+\s/, '')
  replyContent.value = `@${reply.author?.username || reply.author?.name || '匿名用户'} `
  
  // 滚动到回复框
  setTimeout(() => {
    const replyInput = document.querySelector(`.reply-input-section`)
    if (replyInput) {
      replyInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

// 处理删除评论
const handleDelete = () => {
  emit('delete', props.comment.id)
}

// 处理删除回复
const handleReplyDelete = (replyId) => {
  emit('delete', replyId)
}

// 跳转到用户主页
const goToUserProfile = (userId) => {
  if (userId) {
    router.push(`/user/${userId}`)
  }
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.comment-avatar:hover {
  transform: scale(1.05);
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.comment-author {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-delete-btn {
  margin-left: auto;
  color: #909399;
  font-size: 12px;
}

.comment-delete-btn:hover {
  color: #f56c6c;
}

.comment-text {
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
  word-wrap: break-word;
  font-size: 14px;
  white-space: pre-wrap;
}

.comment-footer {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.action-button {
  color: #909399;
  font-size: 12px;
  padding: 0;
  height: auto;
}

.action-button:hover {
  color: #1890ff;
}

.action-button.liked,
.reply-action.liked {
  color: #1890ff;
}

.replies-list {
  margin-top: 1rem;
  padding-left: 1.5rem;
  border-left: 2px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reply-item {
  background-color: #fafafa;
  padding: 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  font-size: 12px;
}

.reply-author {
  font-weight: 600;
  color: #303133;
  font-size: 12px;
}

.reply-to {
  color: #909399;
  font-size: 12px;
}

.reply-target {
  color: #1890ff;
  font-size: 12px;
}

.reply-delete-btn {
  margin-left: auto;
  color: #909399;
  font-size: 12px;
}

.reply-delete-btn:hover {
  color: #f56c6c;
}

.reply-content {
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.reply-footer {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 12px;
}

.reply-time {
  color: #909399;
}

.reply-action {
  color: #909399;
  font-size: 12px;
  padding: 0;
  height: auto;
}

.reply-action:hover {
  color: #1890ff;
}

.reply-input-section {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fafafa;
  border-radius: 6px;
  animation: slideIn 0.3s ease;
}

.reply-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
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

.comment-appear {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗黑模式支持 */
:global(.dark) .comment-item {
  border-bottom-color: #333;
}

:global(.dark) .comment-author,
:global(.dark) .comment-text {
  color: #e0e0e0;
}

:global(.dark) .comment-time {
  color: #777;
}

:global(.dark) .action-button,
:global(.dark) .reply-action,
:global(.dark) .reply-time,
:global(.dark) .reply-to {
  color: #777;
}

:global(.dark) .action-button:hover,
:global(.dark) .reply-action:hover {
  color: #66b1ff;
}

:global(.dark) .action-button.liked,
:global(.dark) .reply-action.liked,
:global(.dark) .reply-target {
  color: #66b1ff;
}

:global(.dark) .replies-list {
  border-left-color: #333;
}

:global(.dark) .reply-item,
:global(.dark) .reply-input-section {
  background-color: #2c2c2c;
}

:global(.dark) .reply-author,
:global(.dark) .reply-content {
  color: #e0e0e0;
}

:global(.dark) .comment-delete-btn:hover,
:global(.dark) .reply-delete-btn:hover {
  color: #ff7875;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-item {
    gap: 0.75rem;
    padding: 1rem 0;
  }
  
  .comment-avatar {
    width: 40px !important;
    height: 40px !important;
  }
  
  .comment-header {
    gap: 0.75rem;
  }
  
  .comment-footer {
    gap: 1.25rem;
  }
  
  .comment-text {
    font-size: 13px;
  }
  
  .replies-list {
    padding-left: 1rem;
    gap: 0.75rem;
  }
  
  .reply-item {
    padding: 0.75rem;
  }
  
  .reply-content {
    font-size: 12px;
  }
  
  .reply-footer {
    gap: 1rem;
  }
  
  .reply-input-actions {
    gap: 0.5rem;
  }
}
</style>