import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
// 导入评论API（与comment.js的导出名称完全匹配）
import {
  getArticleComments,
  createComment,
  likeComment,
  deleteComment
} from '@/api/modules/comment'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    currentArticleComments: [], // 当前文章的评论列表（含回复）
    totalComments: 0, // 评论总数
    loading: false, // 加载状态
    likeLoading: new Map() // 点赞加载状态（避免重复点击）
  }),
  actions: {
    /**
     * 获取文章评论列表
     * @param articleId 文章ID
     * @param page 页码
     * @param pageSize 每页条数
     */
    async fetchArticleComments(articleId, page = 1, pageSize = 10) {
      this.loading = true
      try {
        // 后端返回格式：{ code: 200, data: { commentsLikeVOs: [], total: 2 } }
        const res = await getArticleComments(articleId, page, pageSize)

        // 兼容后端两种返回格式（带data层/不带data层）
        const commentData = res.data || res
        const commentsList = commentData.commentsLikeVOs || []

        // 格式化评论数据：统一前后端字段
        this.currentArticleComments = commentsList.map(comment => ({
          id: comment.id,
          articleId: comment.articleId,
          content: comment.content || '',
          likeCount: comment.likeCount || 0,
          isLiked: comment.isLiked || false,
          createTime: comment.createTime || new Date().toISOString(),
          parentId: comment.parentId || null,
          author: {
            id: comment.userId,
            username: comment.userName || '匿名用户',
            avatar: comment.userAvatar || '/default-avatar.svg'
          },
          replies: comment.replies || [] // 回复列表
        }))

        // 设置评论总数
        this.totalComments = commentData.total || commentsList.length
      } catch (error) {
        console.error('获取评论失败:', error)
        ElMessage.error('获取评论失败，请稍后重试')
        this.currentArticleComments = []
        this.totalComments = 0
      } finally {
        this.loading = false
      }
    },

    /**
     * 发布评论/回复
     * @param data 评论数据
     */
    async submitComment(data) {
      try {
        const res = await createComment(data)
        ElMessage.success('发表成功')
        return res.data || res // 返回新创建的评论数据
      } catch (error) {
        console.error('发表评论失败:', error)
        ElMessage.error('发表失败，请稍后重试')
        throw error // 抛出错误，让组件处理
      }
    },

    /**
     * 点赞评论
     * @param commentId 评论ID
     */
    async likeComment(commentId) {
      if (this.likeLoading.get(commentId)) return // 防止重复点击
      this.likeLoading.set(commentId, true)

      try {
        const res = await likeComment(commentId)
        const newLikeCount = res.data?.likes

        // 更新本地评论的点赞状态和数量
        const updateLikeStatus = (comments) => {
          for (const comment of comments) {
            if (comment.id === commentId) {
              comment.isLiked = true
              comment.likeCount = newLikeCount || comment.likeCount + 1
              return true
            }
            // 递归更新回复的点赞状态
            if (comment.replies && updateLikeStatus(comment.replies)) {
              return true
            }
          }
          return false
        }

        updateLikeStatus(this.currentArticleComments)
        ElMessage.success('点赞成功')
        return true
      } catch (error) {
        console.error('点赞失败:', error)
        ElMessage.error('点赞失败，请稍后重试')
        return false
      } finally {
        this.likeLoading.set(commentId, false)
      }
    },

    /**
     * 删除评论
     * @param commentId 评论ID
     */
    async deleteComment(commentId) {
      try {
        await deleteComment(commentId)

        // 从本地列表中移除评论（含回复）
        const removeComment = (comments) => {
          return comments.filter(comment => {
            if (comment.id === commentId) return false
            // 递归删除回复中的评论
            if (comment.replies) {
              comment.replies = removeComment(comment.replies)
            }
            return true
          })
        }

        this.currentArticleComments = removeComment(this.currentArticleComments)
        this.totalComments = Math.max(0, this.totalComments - 1)
        ElMessage.success('删除成功')
        return true
      } catch (error) {
        console.error('删除评论失败:', error)
        ElMessage.error('删除失败，请稍后重试')
        return false
      }
    }
  }
})