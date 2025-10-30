import { defineStore } from 'pinia'
import * as commentAPI from '../../api/modules/comment'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [],
    currentArticleComments: [],
    commentsLoading: false,
    commentsError: null,
    commentSubmitting: false,
    commentSubmittingError: null,
    currentPage: 1,
    totalPages: 1,
    totalComments: 0,
    pageSize: 10,
    commentLikes: new Map(), // 存储评论点赞状态
    userComments: [],
    userCommentsLoading: false
  }),

  getters: {
    getCommentsByArticle: (state) => (articleId) => {
      return state.currentArticleComments.filter(comment => comment.articleId === articleId)
    },
    
    isCommentLiked: (state) => (commentId) => {
      return state.commentLikes.get(commentId) || false
    },
    
    hasMoreComments: (state) => {
      return state.currentPage < state.totalPages
    }
  },

  actions: {
    // 获取文章评论
    async fetchArticleComments(articleId, page = 1, pageSize = 10) {
      this.commentsLoading = true
      this.commentsError = null
      try {
        const response = await commentAPI.getArticleComments(articleId, {
          page,
          pageSize,
          sortBy: 'createdAt',
          order: 'desc'
        })
        this.currentArticleComments = response.data.comments
        this.currentPage = response.data.currentPage
        this.totalPages = response.data.totalPages
        this.totalComments = response.data.totalComments
        this.pageSize = pageSize
        
        // 更新点赞状态
        response.data.comments.forEach(comment => {
          this.commentLikes.set(comment.id, comment.isLiked || false)
        })
      } catch (error) {
        this.commentsError = error.message || '获取评论失败'
        console.error('获取评论失败:', error)
      } finally {
        this.commentsLoading = false
      }
    },

    // 加载更多评论
    async loadMoreComments(articleId) {
      if (!this.hasMoreComments || this.commentsLoading) return
      
      this.commentsLoading = true
      try {
        const response = await commentAPI.getArticleComments(articleId, {
          page: this.currentPage + 1,
          pageSize: this.pageSize,
          sortBy: 'createdAt',
          order: 'desc'
        })
        this.currentArticleComments.push(...response.data.comments)
        this.currentPage = response.data.currentPage
        
        // 更新点赞状态
        response.data.comments.forEach(comment => {
          this.commentLikes.set(comment.id, comment.isLiked || false)
        })
      } catch (error) {
        this.commentsError = error.message || '加载更多评论失败'
        console.error('加载更多评论失败:', error)
      } finally {
        this.commentsLoading = false
      }
    },

    // 提交评论
    async submitComment(data) {
      this.commentSubmitting = true
      this.commentSubmittingError = null
      try {
        const response = await commentAPI.createComment(data)
        // 添加到评论列表开头
        this.currentArticleComments.unshift(response.data.comment)
        this.totalComments++
        return response.data.comment
      } catch (error) {
        this.commentSubmittingError = error.message || '提交评论失败'
        console.error('提交评论失败:', error)
        throw error
      } finally {
        this.commentSubmitting = false
      }
    },

    // 回复评论
    async replyToComment(data) {
      this.commentSubmitting = true
      this.commentSubmittingError = null
      try {
        const response = await commentAPI.replyToComment(data)
        // 找到父评论并添加回复
        const parentComment = this.currentArticleComments.find(
          comment => comment.id === data.parentCommentId
        )
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = []
          }
          parentComment.replies.push(response.data.reply)
        }
        this.totalComments++
        return response.data.reply
      } catch (error) {
        this.commentSubmittingError = error.message || '回复评论失败'
        console.error('回复评论失败:', error)
        throw error
      } finally {
        this.commentSubmitting = false
      }
    },

    // 删除评论
    async deleteComment(commentId, articleId) {
      try {
        await commentAPI.deleteComment(commentId)
        // 从评论列表中移除
        this.currentArticleComments = this.currentArticleComments.filter(
          comment => comment.id !== commentId
        )
        this.totalComments--
      } catch (error) {
        console.error('删除评论失败:', error)
        throw error
      }
    },

    // 点赞评论
    async likeComment(commentId) {
      try {
        await commentAPI.likeComment(commentId)
        this.commentLikes.set(commentId, true)
        // 更新评论的点赞数
        const comment = this.currentArticleComments.find(c => c.id === commentId)
        if (comment) {
          comment.likeCount = (comment.likeCount || 0) + 1
        }
      } catch (error) {
        console.error('点赞评论失败:', error)
        throw error
      }
    },

    // 取消点赞评论
    async unlikeComment(commentId) {
      try {
        await commentAPI.unlikeComment(commentId)
        this.commentLikes.set(commentId, false)
        // 更新评论的点赞数
        const comment = this.currentArticleComments.find(c => c.id === commentId)
        if (comment && comment.likeCount > 0) {
          comment.likeCount--
        }
      } catch (error) {
        console.error('取消点赞评论失败:', error)
        throw error
      }
    },

    // 获取用户评论
    async fetchUserComments(userId, page = 1, pageSize = 10) {
      this.userCommentsLoading = true
      try {
        const response = await commentAPI.getUserComments({
          userId,
          page,
          pageSize
        })
        this.userComments = response.data.comments
      } catch (error) {
        console.error('获取用户评论失败:', error)
      } finally {
        this.userCommentsLoading = false
      }
    },

    // 清空当前文章的评论
    clearCurrentComments() {
      this.currentArticleComments = []
      this.currentPage = 1
      this.totalPages = 1
      this.totalComments = 0
    },

    // 清除错误
    clearErrors() {
      this.commentsError = null
      this.commentSubmittingError = null
    }
  }
})