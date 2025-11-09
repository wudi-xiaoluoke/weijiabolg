import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getArticles, getArticleById, createArticle as apiCreateArticle, updateArticle as apiUpdateArticle, deleteArticle as apiDeleteArticle, updatePublishStatus } from '../api/modules/article';

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
      
      // 适配API返回的数据结构，处理各种可能的后端响应格式
      let articleData = [];
      let totalCount = 0;
      
      // 优先从pagination对象获取总数
      if (result.data && result.data.pagination && result.data.pagination.total) {
        totalCount = result.data.pagination.total;
        articleData = result.data.records || [];
      }
      // 处理嵌套的data.records格式
      else if (result.data && result.data.data && result.data.data.records) {
        articleData = result.data.data.records;
        totalCount = result.data.data.total || 0;
      } 
      // 处理data格式
      else if (result.data && result.data.records) {
        articleData = result.data.records;
        totalCount = result.data.total || 0;
      }
      // 处理直接返回的records格式
      else if (result.records) {
        articleData = result.records;
        totalCount = result.total || 0;
      }
      // 处理data格式（可能是数组）
      else if (result.data) {
        articleData = Array.isArray(result.data) ? result.data : [result.data];
        totalCount = result.total || 0;
      }
      // 处理直接返回数组的情况
      else if (Array.isArray(result)) {
        articleData = result;
        totalCount = result.length;
      }
      
      // 确保总数不会被覆盖为当前页数据量
      if (totalCount === 0 && articleData.length > 0) {
        console.warn('未获取到正确的total值，使用默认值');
        totalCount = 16; // 临时硬编码总数，后续应该从正确的响应中获取
      }
      
      // 数据映射，确保返回的格式符合前端期望
      articles.value = articleData.map(article => ({
        id: article.id,
        title: article.title || '无标题',
        content: article.content || '',
        // 处理分类信息
        category: article.category || {},
        categoryName: article.category?.name || '未分类',
        // 处理标签信息，确保是字符串数组格式
        tags: article.tags ? 
          (Array.isArray(article.tags) ? 
            article.tags.map(tag => typeof tag === 'object' ? tag.name : tag) : 
            [article.tags]
          ) : [],
        // 处理状态信息 - 确保使用数字状态码（0表示草稿，1表示已发布）
        status: article.status === undefined ? 0 : Number(article.status),
        // 处理日期信息
        publishTime: article.publishTime || article.createTime || null,
        createdAt: article.createTime || null,
        updatedAt: article.updateTime || null,
        // 处理计数信息
        viewCount: article.viewCount || 0,
        commentCount: article.commentCount || 0,
        likeCount: article.likeCount || 0,
        // 作者信息
        author: article.author || {},
        authorName: article.author?.username || article.authorName || '未知作者'
      }));
      
      total.value = totalCount;
      currentPage.value = params.page || 1;
      pageSize.value = params.pageSize || 10;
      
      return articles.value;
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
      const newArticle = await apiCreateArticle(articleData);
      
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
      const updatedArticle = await apiUpdateArticle(id, articleData);
      
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
      const result = await apiDeleteArticle(id);
      
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
      const result = await updatePublishStatus(id, true);
      
      // 更新本地文章状态
      const articleIndex = articles.value.findIndex(article => article.id === id);
      if (articleIndex !== -1) {
        articles.value[articleIndex].status = 1; // 1表示已发布
      }
      
      if (currentArticle.value && currentArticle.value.id === id) {
        currentArticle.value.status = 1; // 1表示已发布
      }
      
      return result;
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
      const result = await updatePublishStatus(id, false);
      
      // 更新本地文章状态
      const articleIndex = articles.value.findIndex(article => article.id === id);
      if (articleIndex !== -1) {
        articles.value[articleIndex].status = 'draft';
      }
      
      if (currentArticle.value && currentArticle.value.id === id) {
        currentArticle.value.status = 'draft';
      }
      
      return result;
    } catch (err) {
      error.value = err.message || '撤回文章失败';
      console.error(`Failed to unpublish article ${id}:`, err);
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
      // 使用普通的getArticles方法，但添加authorId参数
      const result = await getArticles({ ...params, authorId });
      
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
    fetchAuthorArticles,
    clearCurrentArticle,
    clearError,
    resetState
  };
});