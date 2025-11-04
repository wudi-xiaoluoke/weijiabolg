import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import * as socialAPI from '../../api/modules/social'

export const useSocialStore = defineStore('social', {
  state: () => ({
    // 文章点赞状态
    articleLikes: new Map(),
    // 文章收藏状态
    articleFavorites: new Map(),
    // 用户关注状态
    userFollowings: new Map(),
    
    // 加载状态
    likeLoading: false,
    favoriteLoading: false,
    followLoading: false,
    
    // 错误信息
    likeError: null,
    favoriteError: null,
    followError: null,
    
    // 用户相关的社交数据
    userFavorites: [],
    userLikes: [],
    userFollowers: [],
    userFollowing: [],
    
    // 用户社交数据加载状态
    favoritesLoading: false,
    likesLoading: false,
    followersLoading: false,
    followingLoading: false
  }),

  getters: {
    // 检查文章是否被点赞
    isArticleLiked: (state) => (articleId) => {
      return state.articleLikes.get(articleId) || false
    },
    
    // 获取文章点赞数
    getArticleLikeCount: () => (articleId) => {
      // 这个方法主要用于模板中，实际点赞数应该从文章数据中获取
      // 这里返回null让模板回退到使用article.likes或article.likeCount
      return null
    },
    
    // 检查文章是否被收藏
    isArticleFavorited: (state) => (articleId) => {
      return state.articleFavorites.get(articleId) || false
    },
    
    // 检查用户是否被关注
    isUserFollowed: (state) => (userId) => {
      return state.userFollowings.get(userId) || false
    },
    
    // 获取用户的收藏文章数量
    userFavoritesCount: (state) => {
      return state.userFavorites.length
    },
    
    // 获取用户的点赞文章数量
    userLikesCount: (state) => {
      return state.userLikes.length
    },
    
    // 获取用户的粉丝数量
    userFollowersCount: (state) => {
      return state.userFollowers.length
    },
    
    // 获取用户的关注数量
    userFollowingCount: (state) => {
      return state.userFollowing.length
    }
  },

  actions: {
    // 检查认证状态
    checkAuth() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        const error = new Error('用户未登录')
        error.code = 'UNAUTHORIZED'
        throw error
      }
    },
    
    // 更新文章点赞状态
    async updateLikeStatus(articleId, liked) {
      this.likeLoading = true
      this.likeError = null
      try {
        // 检查认证状态
        this.checkAuth()
        
        // 检查是否有操作权限
        const authStore = useAuthStore()
        if (!authStore.hasPermission('like_content') && !authStore.isAdmin) {
          const error = new Error('没有权限进行点赞操作')
          error.code = 'PERMISSION_DENIED'
          throw error
        }
        
        await socialAPI.updateLikeStatus(articleId, liked)
        this.articleLikes.set(articleId, liked)
      } catch (error) {
        this.likeError = error.message || (liked ? '点赞失败' : '取消点赞失败')
        console.error(`${liked ? '点赞' : '取消点赞'}文章失败:`, error)
        throw error
      } finally {
        this.likeLoading = false
      }
    },

    // 收藏文章
    async favoriteArticle(articleId) {
      this.favoriteLoading = true
      this.favoriteError = null
      try {
        // 检查认证状态
        this.checkAuth()
        
        // 检查是否有操作权限
        const authStore = useAuthStore()
        if (!authStore.hasPermission('favorite_content') && !authStore.isAdmin) {
          const error = new Error('没有权限进行收藏操作')
          error.code = 'PERMISSION_DENIED'
          throw error
        }
        
        await socialAPI.favoriteArticle(articleId)
        this.articleFavorites.set(articleId, true)
      } catch (error) {
        this.favoriteError = error.message || '收藏失败'
        console.error('收藏文章失败:', error)
        throw error
      } finally {
        this.favoriteLoading = false
      }
    },

    // 取消收藏文章
    async unfavoriteArticle(articleId) {
      this.favoriteLoading = true
      this.favoriteError = null
      try {
        // 检查认证状态
        this.checkAuth()
        
        await socialAPI.unfavoriteArticle(articleId)
        this.articleFavorites.set(articleId, false)
      } catch (error) {
        this.favoriteError = error.message || '取消收藏失败'
        console.error('取消收藏文章失败:', error)
        throw error
      } finally {
        this.favoriteLoading = false
      }
    },

    // 关注用户
    async followUser(userId) {
      this.followLoading = true
      this.followError = null
      try {
        // 检查认证状态
        this.checkAuth()
        
        // 检查是否有操作权限
        const authStore = useAuthStore()
        if (!authStore.hasPermission('follow_users') && !authStore.isAdmin) {
          const error = new Error('没有权限进行关注操作')
          error.code = 'PERMISSION_DENIED'
          throw error
        }
        
        await socialAPI.followUser(userId)
        this.userFollowings.set(userId, true)
      } catch (error) {
        this.followError = error.message || '关注失败'
        console.error('关注用户失败:', error)
        throw error
      } finally {
        this.followLoading = false
      }
    },

    // 取消关注用户
    async unfollowUser(userId) {
      this.followLoading = true
      this.followError = null
      try {
        // 检查认证状态
        this.checkAuth()
        
        await socialAPI.unfollowUser(userId)
        this.userFollowings.set(userId, false)
      } catch (error) {
        this.followError = error.message || '取消关注失败'
        console.error('取消关注用户失败:', error)
        throw error
      } finally {
        this.followLoading = false
      }
    },

    // 获取文章点赞状态
    async fetchArticleLikeStatus(articleId) {
      try {
        const response = await socialAPI.getArticleLikeStatus(articleId)
        this.articleLikes.set(articleId, response.data.isLiked)
        return response.data.isLiked
      } catch (error) {
        console.error('获取文章点赞状态失败:', error)
        return false
      }
    },

    // 获取文章收藏状态
    async fetchArticleFavoriteStatus(articleId) {
      try {
        const response = await socialAPI.getArticleFavoriteStatus(articleId)
        this.articleFavorites.set(articleId, response.data.isFavorited)
        return response.data.isFavorited
      } catch (error) {
        console.error('获取文章收藏状态失败:', error)
        return false
      }
    },

    // 获取用户关注状态
    async fetchFollowStatus(userId) {
      try {
        const response = await socialAPI.getFollowStatus(userId)
        this.userFollowings.set(userId, response.data.isFollowing)
        return response.data.isFollowing
      } catch (error) {
        console.error('获取用户关注状态失败:', error)
        return false
      }
    },

    // 获取用户收藏列表
    async fetchUserFavorites(page = 1, pageSize = 10) {
      this.favoritesLoading = true
      try {
        const response = await socialAPI.getUserFavorites({ page, pageSize })
        this.userFavorites = response.data.articles
      } catch (error) {
        console.error('获取用户收藏列表失败:', error)
      } finally {
        this.favoritesLoading = false
      }
    },

    // 获取用户点赞列表
    async fetchUserLikes(page = 1, pageSize = 10) {
      this.likesLoading = true
      try {
        const response = await socialAPI.getUserLikes({ page, pageSize })
        this.userLikes = response.data.articles
      } catch (error) {
        console.error('获取用户点赞列表失败:', error)
      } finally {
        this.likesLoading = false
      }
    },

    // 获取用户粉丝列表
    async fetchUserFollowers(userId, page = 1, pageSize = 10) {
      this.followersLoading = true
      try {
        const response = await socialAPI.getUserFollowers(userId, { page, pageSize })
        this.userFollowers = response.data.followers
      } catch (error) {
        console.error('获取用户粉丝列表失败:', error)
      } finally {
        this.followersLoading = false
      }
    },

    // 获取用户关注列表
    async fetchUserFollowing(userId, page = 1, pageSize = 10) {
      this.followingLoading = true
      try {
        const response = await socialAPI.getUserFollowing(userId, { page, pageSize })
        this.userFollowing = response.data.following
      } catch (error) {
        console.error('获取用户关注列表失败:', error)
      } finally {
        this.followingLoading = false
      }
    },

    // 分享文章
    async shareArticle(articleId, platform) {
      try {
        // 公开分享可以不用登录，但记录分享行为需要登录
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          // 记录分享行为
          await socialAPI.shareArticle({ articleId, platform })
        }
        
        // 返回分享链接或相关信息
        return { success: true, articleId, platform }
      } catch (error) {
        console.error('分享文章失败:', error)
        throw error
      }
    },

    // 批量更新文章点赞状态
    updateArticleLikesBatch(articles) {
      articles.forEach(article => {
        if (article.isLiked !== undefined) {
          this.articleLikes.set(article.id, article.isLiked)
        }
      })
    },

    // 批量更新文章收藏状态
    updateArticleFavoritesBatch(articles) {
      articles.forEach(article => {
        if (article.isFavorited !== undefined) {
          this.articleFavorites.set(article.id, article.isFavorited)
        }
      })
    },

    // 清除错误
    clearErrors() {
      this.likeError = null
      this.favoriteError = null
      this.followError = null
    },

    // 重置所有状态（用于登出）
    resetAll() {
      this.articleLikes.clear()
      this.articleFavorites.clear()
      this.userFollowings.clear()
      this.userFavorites = []
      this.userLikes = []
      this.userFollowers = []
      this.userFollowing = []
      this.clearErrors()
    },
    
    // 注册登出时的重置操作
    setupLogoutReset() {
      const authStore = useAuthStore()
      // 在实际项目中，这里可以使用订阅或其他方式监听登出事件
      // 由于pinia没有内置的事件系统，这里只是预留接口
    }
  }
})