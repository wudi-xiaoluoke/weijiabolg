import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getArticles, getArticleById, createArticle, updateArticle, deleteArticle, publishArticle, unpublishArticle, toggleHotArticle, toggleFeaturedArticle, getAuthorArticles } from '../api/modules/article';

export const useArticleStore = defineStore('article', () => {
  // 状态
  const articles = ref([]);
  const currentArticle = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  
  // 计算属性
  const articlesList = computed(() => articles.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);
  const errorMessage = computed(() => error.value);
  const totalArticles = computed(() => total.value);
  const paginationInfo = computed(() => ({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
    totalPages: Math.ceil(total.value / pageSize.value)
  }));
  
  // 操作
  // 获取文章列表
  const fetchArticles = async (params = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await getArticles(params);
      
      // 适配API返回的数据结构
      if (result.data) {
        articles.value = result.data;
        total.value = result.total || result.data.length;
      } else {
        // 模拟环境下可能直接返回数组
        articles.value = result;
        total.value = result.length;
      }
      
      currentPage.value = params.page || 1;
      pageSize.value = params.pageSize || 10;
      
      return result;
    } catch (err) {
      error.value = err.message || '获取文章列表失败';
      console.error('Failed to fetch articles:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取文章详情
  const fetchArticleById = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await getArticleById(id);
      currentArticle.value = result;
      return currentArticle.value;
    } catch (err) {
      error.value = err.message || '获取文章详情失败';
      console.error(`Failed to fetch article ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 创建文章
  const createArticle = async (articleData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const newArticle = await createArticle(articleData);
      
      // 更新本地状态
      articles.value.unshift(newArticle);
      currentArticle.value = newArticle;
      total.value++;
      
      return newArticle;
    } catch (err) {
      error.value = err.message || '创建文章失败';
      console.error('Failed to create article:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 更新文章
  const updateArticle = async (id, articleData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedArticle = await updateArticle(id, articleData);
      
      // 更新本地状态
      const index = articles.value.findIndex(article => article.id === id);
      if (index !== -1) {
        articles.value[index] = updatedArticle;
      }
      
      if (currentArticle.value && currentArticle.value.id === id) {
        currentArticle.value = updatedArticle;
      }
      
      return updatedArticle;
    } catch (err) {
      error.value = err.message || '更新文章失败';
      console.error(`Failed to update article ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 删除文章
  const deleteArticle = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await deleteArticle(id);
      
      // 更新本地状态
      const index = articles.value.findIndex(article => article.id === id);
      if (index !== -1) {
        articles.value.splice(index, 1);
        total.value--;
      }
      
      if (currentArticle.value && currentArticle.value.id === id) {
        currentArticle.value = null;
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '删除文章失败';
      console.error(`Failed to delete article ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 发布文章
  const publishArticle = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const publishedArticle = await publishArticle(id);
      
      // 更新本地状态
      const index = articles.value.findIndex(article => article.id === id);
      if (index !== -1) {
        articles.value[index] = publishedArticle;
      }
      
      if (currentArticle.value && currentArticle.value.id === id) {
        currentArticle.value = publishedArticle;
      }
      
      return publishedArticle;
    } catch (err) {
      error.value = err.message || '发布文章失败';
      console.error(`Failed to publish article ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 撤回文章
  const unpublishArticle = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const unpublishedArticle = await unpublishArticle(id);
      
      // 更新本地状态
      const index = articles.value.findIndex(article => article.id === id);
      if (index !== -1) {
        articles.value[index] = unpublishedArticle;
      }
      
      if (currentArticle.value && currentArticle.value.id === id) {
        currentArticle.value = unpublishedArticle;
      }
      
      return unpublishedArticle;
    } catch (err) {
      error.value = err.message || '撤回文章失败';
      console.error(`Failed to unpublish article ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 设置热门文章
  const toggleHotArticle = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedArticle = await toggleHotArticle(id);
      
      // 更新本地状态
      const index = articles.value.findIndex(article => article.id === id);
      if (index !== -1) {
        articles.value[index] = updatedArticle;
      }
      
      if (currentArticle.value && currentArticle.value.id === id) {
        currentArticle.value = updatedArticle;
      }
      
      return updatedArticle;
    } catch (err) {
      error.value = err.message || '设置热门文章失败';
      console.error(`Failed to toggle hot article ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 设置精选文章
  const toggleFeaturedArticle = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedArticle = await toggleFeaturedArticle(id);
      
      // 更新本地状态
      const index = articles.value.findIndex(article => article.id === id);
      if (index !== -1) {
        articles.value[index] = updatedArticle;
      }
      
      if (currentArticle.value && currentArticle.value.id === id) {
        currentArticle.value = updatedArticle;
      }
      
      return updatedArticle;
    } catch (err) {
      error.value = err.message || '设置精选文章失败';
      console.error(`Failed to toggle featured article ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取作者的文章列表
  const fetchAuthorArticles = async (authorId, params = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await getAuthorArticles(authorId, params);
      
      // 适配API返回的数据结构
      if (result.data) {
        articles.value = result.data;
        total.value = result.total || result.data.length;
      } else {
        articles.value = result;
        total.value = result.length;
      }
      
      currentPage.value = params.page || 1;
      pageSize.value = params.pageSize || 10;
      
      return result;
    } catch (err) {
      error.value = err.message || '获取作者文章列表失败';
      console.error(`Failed to fetch articles for author ${authorId}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // 清除当前文章
  const clearCurrentArticle = () => {
    currentArticle.value = null;
  };
  
  // 清除错误
  const clearError = () => {
    error.value = null;
  };
  
  // 重置状态
  const resetState = () => {
    articles.value = [];
    currentArticle.value = null;
    loading.value = false;
    error.value = null;
    total.value = 0;
    currentPage.value = 1;
    pageSize.value = 10;
  };
  
  return {
    // 状态
    articles,
    currentArticle,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    
    // 计算属性
    articlesList,
    isLoading,
    hasError,
    errorMessage,
    totalArticles,
    paginationInfo,
    
    // 操作
    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    unpublishArticle,
    toggleHotArticle,
    toggleFeaturedArticle,
    fetchAuthorArticles,
    clearCurrentArticle,
    clearError,
    resetState
  };
});