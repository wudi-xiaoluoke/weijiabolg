import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { commentAPI } from '../api';

export const useCommentStore = defineStore('comment', {
  state: () => ({
    // 评论列表
    comments: [],
    // 评论树结构（用于文章详情页展示）
    commentTree: [],
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0
    },
    // 加载状态
    isLoading: false,
    // 当前编辑的评论
    currentComment: null,
    // 评论统计信息
    stats: {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      spam: 0,
      topLevel: 0
    },
    // 热门评论
    popularComments: [],
    // 最近评论
    recentComments: []
  }),
  
  getters: {
    // 获取所有评论数量
    totalComments: (state) => state.stats.total,
    
    // 获取已批准的评论
    approvedComments: (state) => state.comments.filter(comment => comment.status === 'approved'),
    
    // 获取待审核的评论
    pendingComments: (state) => state.comments.filter(comment => comment.status === 'pending'),
    
    // 获取被拒绝的评论
    rejectedComments: (state) => state.comments.filter(comment => comment.status === 'rejected'),
    
    // 获取垃圾评论
    spamComments: (state) => state.comments.filter(comment => comment.status === 'spam'),
    
    // 根据ID获取评论
    getCommentById: (state) => (id) => {
      return state.comments.find(comment => comment.id === id) || null;
    },
    
    // 获取指定文章的评论树
    getArticleComments: (state) => (articleId) => {
      return state.commentTree[articleId] || [];
    },
    
    // 检查评论是否被当前用户点赞
    isCommentLiked: (state) => (commentId) => {
      const comment = state.comments.find(c => c.id === commentId);
      return comment ? comment.isLiked : false;
    }
  },
  
  actions: {
    // 获取评论列表
    async fetchComments(params = {}) {
      this.isLoading = true;
      try {
        const response = await commentAPI.getComments({
          page: params.page || this.pagination.currentPage,
          pageSize: params.pageSize || this.pagination.pageSize,
          ...params
        });
        
        this.comments = response.data || [];
        this.pagination = {
          ...this.pagination,
          currentPage: response.pagination?.currentPage || 1,
          pageSize: response.pagination?.pageSize || 10,
          total: response.pagination?.total || 0
        };
        
        return response;
      } catch (error) {
        ElMessage.error('获取评论列表失败: ' + (error.message || '未知错误'));
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 获取文章的评论树
    async fetchArticleComments(articleId, params = {}) {
      this.isLoading = true;
      try {
        const response = await commentAPI.getComments({
          articleId,
          flat: false, // 获取嵌套结构
          ...params
        });
        
        // 存储文章评论树
        if (!this.commentTree) {
          this.commentTree = {};
        }
        this.commentTree[articleId] = response.data || [];
        
        return response;
      } catch (error) {
        ElMessage.error('获取文章评论失败: ' + (error.message || '未知错误'));
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // 根据ID获取评论详情
    async fetchCommentById(id) {
      try {
        const comment = await commentAPI.getCommentById(id);
        this.currentComment = comment;
        return comment;
      } catch (error) {
        ElMessage.error('获取评论详情失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 创建评论
    async createComment(commentData) {
      try {
        const newComment = await commentAPI.createComment(commentData);
        
        // 如果是回复评论，需要更新评论树
        if (commentData.articleId) {
          await this.fetchArticleComments(commentData.articleId);
        }
        
        // 如果是管理界面，也更新列表
        if (this.comments.length > 0) {
          this.comments.unshift(newComment);
          this.pagination.total += 1;
        }
        
        ElMessage.success('评论创建成功');
        return newComment;
      } catch (error) {
        ElMessage.error('创建评论失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 更新评论
    async updateComment(id, updateData) {
      try {
        const updatedComment = await commentAPI.updateComment(id, updateData);
        
        // 更新列表中的评论
        const index = this.comments.findIndex(comment => comment.id === id);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
        
        // 更新当前评论
        if (this.currentComment?.id === id) {
          this.currentComment = updatedComment;
        }
        
        // 更新评论树
        if (updatedComment.articleId) {
          await this.fetchArticleComments(updatedComment.articleId);
        }
        
        ElMessage.success('评论更新成功');
        return updatedComment;
      } catch (error) {
        ElMessage.error('更新评论失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 删除评论
    async deleteComment(id) {
      try {
        await commentAPI.deleteComment(id);
        
        // 从列表中移除
        const comment = this.comments.find(c => c.id === id);
        if (comment) {
          this.comments = this.comments.filter(c => c.id !== id);
          this.pagination.total = Math.max(0, this.pagination.total - 1);
          
          // 更新评论树
          if (comment.articleId) {
            await this.fetchArticleComments(comment.articleId);
          }
        }
        
        ElMessage.success('评论删除成功');
        return { success: true };
      } catch (error) {
        ElMessage.error('删除评论失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 批量删除评论
    async batchDeleteComments(ids) {
      try {
        const result = await commentAPI.batchDeleteComments(ids);
        
        // 从列表中移除
        this.comments = this.comments.filter(comment => !ids.includes(comment.id));
        this.pagination.total = Math.max(0, this.pagination.total - ids.length);
        
        // 更新评论树（如果这些评论属于同一文章）
        const articleIds = [...new Set(
          this.comments
            .filter(comment => ids.includes(comment.id))
            .map(comment => comment.articleId)
        )];
        
        for (const articleId of articleIds) {
          await this.fetchArticleComments(articleId);
        }
        
        ElMessage.success(`成功删除 ${ids.length} 条评论`);
        return result;
      } catch (error) {
        ElMessage.error('批量删除评论失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 点赞评论
    async likeComment(id) {
      try {
        const updatedComment = await commentAPI.likeComment(id);
        
        // 更新列表中的评论
        const index = this.comments.findIndex(comment => comment.id === id);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
        
        // 更新评论树
        this._updateCommentInTree(id, updatedComment);
        
        return updatedComment;
      } catch (error) {
        ElMessage.error('点赞失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 取消点赞
    async unlikeComment(id) {
      try {
        const updatedComment = await commentAPI.unlikeComment(id);
        
        // 更新列表中的评论
        const index = this.comments.findIndex(comment => comment.id === id);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
        
        // 更新评论树
        this._updateCommentInTree(id, updatedComment);
        
        return updatedComment;
      } catch (error) {
        ElMessage.error('取消点赞失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 审核评论
    async moderateComment(id, status) {
      try {
        const updatedComment = await commentAPI.moderateComment(id, { status });
        
        // 更新列表中的评论
        const index = this.comments.findIndex(comment => comment.id === id);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
        
        // 更新评论树
        this._updateCommentInTree(id, updatedComment);
        
        ElMessage.success('评论状态更新成功');
        return updatedComment;
      } catch (error) {
        ElMessage.error('更新评论状态失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 批量审核评论
    async batchModerateComments(ids, status) {
      try {
        const result = await commentAPI.batchModerateComments({ ids, status });
        
        // 更新列表中的评论
        this.comments = this.comments.map(comment => {
          if (ids.includes(comment.id)) {
            return { ...comment, status };
          }
          return comment;
        });
        
        // 更新评论树
        ids.forEach(id => {
          const comment = this.comments.find(c => c.id === id);
          if (comment) {
            this._updateCommentInTree(id, { ...comment, status });
          }
        });
        
        ElMessage.success(`成功更新 ${ids.length} 条评论状态`);
        return result;
      } catch (error) {
        ElMessage.error('批量更新评论状态失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 获取评论统计
    async fetchCommentStats(params = {}) {
      try {
        const stats = await commentAPI.getCommentStats(params);
        this.stats = stats;
        return stats;
      } catch (error) {
        ElMessage.error('获取评论统计失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 获取热门评论
    async fetchPopularComments(params = {}) {
      try {
        const comments = await commentAPI.getPopularComments(params);
        this.popularComments = comments;
        return comments;
      } catch (error) {
        ElMessage.error('获取热门评论失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 获取最近评论
    async fetchRecentComments(params = {}) {
      try {
        const comments = await commentAPI.getRecentComments(params);
        this.recentComments = comments;
        return comments;
      } catch (error) {
        ElMessage.error('获取最近评论失败: ' + (error.message || '未知错误'));
        throw error;
      }
    },
    
    // 刷新评论列表
    async refreshComments() {
      return this.fetchComments({ page: 1 });
    },
    
    // 重置状态
    reset() {
      this.comments = [];
      this.commentTree = {};
      this.pagination = {
        currentPage: 1,
        pageSize: 10,
        total: 0
      };
      this.currentComment = null;
    },
    
    // 私有方法：更新评论树中的评论
    _updateCommentInTree(commentId, updatedComment) {
      if (!this.commentTree) return;
      
      const updateCommentInArray = (comments) => {
        for (let i = 0; i < comments.length; i++) {
          if (comments[i].id === commentId) {
            comments[i] = updatedComment;
            return true;
          }
          if (comments[i].replies && comments[i].replies.length > 0) {
            if (updateCommentInArray(comments[i].replies)) {
              return true;
            }
          }
        }
        return false;
      };
      
      // 遍历所有文章的评论树
      Object.values(this.commentTree).forEach(comments => {
        updateCommentInArray(comments);
      });
    }
  }
});