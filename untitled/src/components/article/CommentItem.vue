<template>
  <div class="comment-item">
    <img 
      :src="comment.author?.avatar || '/default-avatar.svg'" 
      alt="用户头像" 
      class="comment-avatar"
      @click="goToUserProfile(comment.author?.id)"
    />
    
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-author" @click="goToUserProfile(comment.author?.id)">{{ comment.author?.name || '匿名用户' }}</span>
        <span class="comment-time">{{ formatCommentTime(comment.createdAt) }}</span>
        <!-- 只有评论作者才能删除评论 -->
        <span 
          v-if="isAuthor" 
          class="comment-delete" 
          @click="handleDelete"
        >
          <i class="el-icon-delete"></i>
          删除
        </span>
      </div>
      
      <div class="comment-text">{{ comment.content }}</div>
      
      <div class="comment-footer">
        <span class="comment-like" @click="handleLike" :disabled="isLiking">
          <i :class="['el-icon-thumb', { 'liked': isCommentLiked }]"></i>
          {{ commentLikeCount }}
        </span>
        
        <span class="comment-reply" @click="handleReply">
          <i class="el-icon-chat-dot-round"></i>
          回复
        </span>
      </div>
      
      <!-- 回复列表 -->
      <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
        <div 
          v-for="reply in comment.replies" 
          :key="reply.id" 
          class="reply-item"
        >
          <div class="reply-header">
            <span class="reply-author" @click="goToUserProfile(reply.author?.id)">{{ reply.author?.name || '匿名用户' }}</span>
            <span class="reply-to">回复</span>
            <span class="reply-target">{{ reply.targetAuthor?.name || '匿名用户' }}</span>
            <span 
              v-if="isReplyAuthor(reply)" 
              class="reply-delete" 
              @click="handleReplyDelete(reply.id)"
            >
              <i class="el-icon-delete"></i>
              删除
            </span>
          </div>
          
          <div class="reply-content">{{ reply.content }}</div>
          
          <div class="reply-footer">
            <span class="reply-time">{{ formatCommentTime(reply.createdAt) }}</span>
            <span class="reply-like" @click="handleReplyLike(reply)" :disabled="isLiking">
              <i :class="['el-icon-thumb', { 'liked': isReplyLiked(reply.id) }]"></i>
              {{ socialStore.getCommentLikeCount(reply.id) || reply.likeCount || 0 }}
            </span>
            <span class="reply-reply" @click="handleReplyToReply(reply)">
              <i class="el-icon-chat-dot-round"></i>
              回复
            </span>
          </div>
        </div>
      </div>
      
      <!-- 回复输入框 -->
      <div v-if="isReplying" class="reply-input-section" :data-reply-id="comment.id">
        <textarea
          v-model="replyContent"
          rows="2"
          placeholder="回复评论..."
          class="reply-textarea"
        ></textarea>
        <div class="reply-input-actions">
          <button @click="cancelReply" class="cancel-btn">取消</button>
          <button 
            @click="submitReply"
            class="submit-btn"
            :disabled="!replyContent.trim() || submittingReply"
          >
            {{ submittingReply ? '回复中...' : '回复' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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
  isLoggedIn: {
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

// 计算属性 - 从social store获取评论点赞状态
const isCommentLiked = computed(() => socialStore.isCommentLiked(props.comment.id))

// 从social store获取评论点赞数
const commentLikeCount = computed(() => {
  return socialStore.getCommentLikeCount(props.comment.id) || props.comment.likeCount || 0
})

// 判断是否是评论作者
const isAuthor = computed(() => {
  return props.currentUserId && props.comment.author?.id === props.currentUserId
})

// 判断回复是否是作者
const isReplyAuthor = (reply) => {
  return props.currentUserId && reply.author?.id === props.currentUserId
}

// 格式化评论时间
const formatCommentTime = (dateString) => {
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
  if (!props.isLoggedIn) {
    // 触发父组件的登录提示
    emit('like', props.comment.id, isCommentLiked.value, true)
    return
  }
  
  isLiking.value = true
  try {
    // 使用social store处理评论点赞
    await socialStore.toggleCommentLike(props.comment.id)
    emit('like', props.comment.id, !isCommentLiked.value)
    
    // 显示点赞成功提示
    ElMessage.success(isCommentLiked.value ? '取消点赞成功' : '点赞成功')
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    isLiking.value = false
  }
}

// 处理回复
const handleReply = () => {
  if (!props.isLoggedIn) {
    // 触发父组件的登录提示
    emit('reply', props.comment.id, '', true)
    return
  }
  
  isReplying.value = true
  replyContent.value = ''
  
  // 滚动到回复框
  setTimeout(() => {
    const replyInput = document.querySelector(`[data-reply-id="${props.comment.id}"]`)
    if (replyInput) {
      replyInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

// 取消回复
const cancelReply = () => {
  isReplying.value = false
  replyContent.value = ''
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) return
  
  submittingReply.value = true
  try {
    // 触发父组件的回复提交
    await emit('reply', props.comment.id, replyContent.value.trim())
    
    // 清空输入
    replyContent.value = ''
    isReplying.value = false
  } catch (error) {
    console.error('发表回复失败:', error)
    ElMessage.error('回复失败，请稍后重试')
  } finally {
    submittingReply.value = false
  }
}

// 判断回复是否已点赞 - 使用social store
const isReplyLiked = (replyId) => {
  return socialStore.isCommentLiked(replyId)
}

// 处理回复点赞
const handleReplyLike = async (reply) => {
  if (!props.isLoggedIn) {
    // 触发父组件的登录提示
    emit('like', reply.id, isReplyLiked(reply.id), true)
    return
  }
  
  isLiking.value = true
  try {
    // 使用social store处理回复点赞
    await socialStore.toggleCommentLike(reply.id)
    emit('like', reply.id, !isReplyLiked(reply.id))
    
    // 显示点赞成功提示
    ElMessage.success(isReplyLiked(reply.id) ? '取消点赞成功' : '点赞成功')
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    isLiking.value = false
  }
}

// 处理回复的回复
const handleReplyToReply = (reply) => {
  if (!props.isLoggedIn) {
    // 触发父组件的登录提示
    emit('reply', props.comment.id, '', true)
    return
  }
  
  isReplying.value = true
  replyContent.value = `@${reply.author?.name || '匿名用户'} `
  
  // 滚动到回复框
  setTimeout(() => {
    const replyInput = document.querySelector(`[data-reply-id="${props.comment.id}"]`)
    if (replyInput) {
      replyInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

// 处理删除评论
const handleDelete = () => {
  if (confirm('确定要删除这条评论吗？')) {
    emit('delete', props.comment.id)
  }
}

// 处理删除回复
const handleReplyDelete = (replyId) => {
  if (confirm('确定要删除这条回复吗？')) {
    // 在实际项目中，这里应该调用API删除回复
    // 这里简化处理，直接从评论的回复列表中移除
    if (props.comment.replies) {
      props.comment.replies = props.comment.replies.filter(reply => reply.id !== replyId)
    }
  }
}

// 跳转到用户主页
const goToUserProfile = (userId) => {
  router.push(`/user/${userId}`)
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: #303133;
}

.comment-time {
  font-size: 14px;
  color: #909399;
}

.comment-text {
  font-size: 15px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 12px;
  word-break: break-word;
}

.comment-footer {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.comment-like,
.comment-reply,
.reply-like,
.reply-reply {
  color: #909399;
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-like:hover,
.comment-reply:hover,
.reply-like:hover,
.reply-reply:hover {
  color: #1890ff;
}

.comment-like.liked,
.reply-like.liked {
  color: #1890ff;
}

.replies-list {
  margin-top: 16px;
  padding-left: 20px;
  border-left: 2px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-item {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.reply-author {
  font-weight: 600;
  color: #303133;
}

.reply-to {
  color: #909399;
}

.reply-target {
  color: #1890ff;
}

.reply-content {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 8px;
}

.reply-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
}

.reply-time {
  color: #909399;
}

.reply-input-section {
  margin-top: 16px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.reply-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-item {
    gap: 8px;
  }
  
  .comment-avatar {
    width: 32px;
    height: 32px;
  }
  
  .comment-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .comment-text {
    font-size: 14px;
  }
  
  .reply-item {
    padding: 12px;
  }
}
</style>