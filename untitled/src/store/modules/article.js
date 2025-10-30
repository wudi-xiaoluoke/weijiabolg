import { defineStore } from 'pinia'
import * as articleAPI from '../../api/modules/article'

export const useArticleStore = defineStore('article', {
  state: () => ({
    // 文章列表数据
    articles: [],
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0
    },
    // 文章详情
    currentArticle: null,
    // 用户文章列表
    userArticles: [],
    userArticlesPagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0
    },
    // 热门文章
    hotArticles: [],
    // 推荐文章
    recommendArticles: [],
    // 加载状态
    loading: false,
    loadingDetail: false,
    loadingUserArticles: false,
    submitting: false,
    deleting: false,
    // 错误信息
    error: null
  }),
  
  getters: {
    // 已发布的文章数量
    publishedArticleCount: (state) => {
      return state.userArticles.filter(article => article.status === 'published').length
    },
    // 草稿文章数量
    draftArticleCount: (state) => {
      return state.userArticles.filter(article => article.status === 'draft').length
    }
  },
  
  actions: {
    // 获取文章列表
    async fetchArticleList(params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const { page = 1, pageSize = 10, ...otherParams } = params
        
        const response = await articleAPI.getArticles({
          page,
          pageSize,
          ...otherParams
        })
        
        // 适配后端返回的Result对象格式
        if (response.data && response.data.data) {
          // 后端返回的是Result对象，内部data是PageResultVO，包含records字段
          const pageResult = response.data.data
          this.articles = pageResult.records || []
          this.pagination = {
            currentPage: pageResult.current || page,
            pageSize: pageResult.size || pageSize,
            total: pageResult.total || 0
          }
          // 返回PageResultVO对象，供组件使用
          return pageResult
        } else if (response.data) {
          // 兼容直接返回PageResultVO的情况
          this.articles = response.data.records || []
          this.pagination = {
            currentPage: response.data.current || page,
            pageSize: response.data.size || pageSize,
            total: response.data.total || 0
          }
          return response.data
        } else {
          // 兼容其他格式
          this.articles = []
          this.pagination = {
            currentPage: page,
            pageSize: pageSize,
            total: 0
          }
          return { records: [], total: 0 }
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取文章列表失败'
        console.error('获取文章列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取文章详情
    async fetchArticleDetail(id) {
      this.loadingDetail = true
      this.error = null
      
      try {
        const response = await articleAPI.getArticleById(id)
        // 适配后端返回的Result对象格式
        if (response.data && response.data.data) {
          this.currentArticle = response.data.data
          return response.data.data
        } else {
          this.currentArticle = response.data
          return response.data
        }
      } catch (error) {
        this.error = error.response?.data?.message || '获取文章详情失败'
        console.error('获取文章详情失败:', error)
        throw error
      } finally {
        this.loadingDetail = false
      }
    },
    
    // 创建文章
    async createArticle(articleData) {
      this.submitting = true
      this.error = null
      
      try {
        const response = await articleAPI.createArticle(articleData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '创建文章失败'
        console.error('创建文章失败:', error)
        throw error
      } finally {
        this.submitting = false
      }
    },
    
    // 更新文章
    async updateArticle(id, articleData) {
      this.submitting = true
      this.error = null
      
      try {
        const response = await articleAPI.updateArticle(id, articleData)
        
        // 如果当前查看的是更新的文章，更新详情
        if (this.currentArticle && this.currentArticle.id === id) {
          this.currentArticle = response.data
        }
        
        // 更新用户文章列表中的对应项
        const index = this.userArticles.findIndex(article => article.id === id)
        if (index !== -1) {
          this.userArticles[index] = response.data
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '更新文章失败'
        console.error('更新文章失败:', error)
        throw error
      } finally {
        this.submitting = false
      }
    },
    
    // 删除文章
    async deleteArticle(id) {
      this.deleting = true
      this.error = null
      
      try {
        await articleAPI.deleteArticle(id)
        
        // 从用户文章列表中移除
        this.userArticles = this.userArticles.filter(article => article.id !== id)
        
        // 如果删除的是当前查看的文章，清空详情
        if (this.currentArticle && this.currentArticle.id === id) {
          this.currentArticle = null
        }
        
        return true
      } catch (error) {
        this.error = error.response?.data?.message || '删除文章失败'
        console.error('删除文章失败:', error)
        throw error
      } finally {
        this.deleting = false
      }
    },
    
    // 发布文章
    async publishArticle(id) {
      this.submitting = true
      this.error = null
      
      try {
        const response = await articleAPI.publishArticle(id)
        
        // 更新用户文章列表中的状态
        const index = this.userArticles.findIndex(article => article.id === id)
        if (index !== -1) {
          this.userArticles[index] = { ...this.userArticles[index], ...response.data }
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '发布文章失败'
        console.error('发布文章失败:', error)
        throw error
      } finally {
        this.submitting = false
      }
    },
    
    // 撤回文章
    async withdrawArticle(id) {
      this.submitting = true
      this.error = null
      
      try {
        const response = await articleAPI.withdrawArticle(id)
        
        // 更新用户文章列表中的状态
        const index = this.userArticles.findIndex(article => article.id === id)
        if (index !== -1) {
          this.userArticles[index] = { ...this.userArticles[index], ...response.data }
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '撤回文章失败'
        console.error('撤回文章失败:', error)
        throw error
      } finally {
        this.submitting = false
      }
    },
    
    // 获取用户文章列表
    async fetchUserArticles(params = {}) {
      this.loadingUserArticles = true
      this.error = null
      
      try {
        const { page = 1, pageSize = 10, status = '', ...otherParams } = params
        
        const response = await articleAPI.getUserArticles({
          page,
          pageSize,
          status,
          ...otherParams
        })
        
        this.userArticles = response.data.records
        this.userArticlesPagination = {
          currentPage: response.data.current,
          pageSize: response.data.size,
          total: response.data.total
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取用户文章列表失败'
        console.error('获取用户文章列表失败:', error)
        throw error
      } finally {
        this.loadingUserArticles = false
      }
    },
    
    // 获取热门文章
    async fetchHotArticles(limit = 10) {
      try {
        const response = await articleAPI.getHotArticles(limit)
        this.hotArticles = response.data
        return response.data
      } catch (error) {
        console.error('获取热门文章失败:', error)
        return []
      }
    },
    
    // 获取推荐文章
    async fetchRecommendArticles(limit = 10) {
      try {
        const response = await articleAPI.getRecommendArticles(limit)
        this.recommendArticles = response.data
        return response.data
      } catch (error) {
        console.error('获取推荐文章失败:', error)
        return []
      }
    },
    
    // 清空当前文章
    clearCurrentArticle() {
      this.currentArticle = null
    },
    
    // 清除错误信息
    clearError() {
      this.error = null
    }
  }
})