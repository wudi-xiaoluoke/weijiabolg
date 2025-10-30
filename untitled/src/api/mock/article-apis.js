// 文章API模拟函数
import { applySearchAndSort, applyPagination, generateId, getCurrentUserId, checkPermission } from './utils';

// 导入文章数据（从articles.js导入）
import { articles } from './articles';

// 获取文章列表
export const getArticles = (params = {}) => {
  let result = [...articles];
  
  // 按状态筛选
  if (params.status) {
    result = result.filter(article => article.status === params.status);
  }
  
  // 按分类筛选
  if (params.categoryId) {
    result = result.filter(article => article.categoryId === params.categoryId);
  }
  
  // 按标签筛选
  if (params.tagId) {
    result = result.filter(article => article.tagIds.includes(params.tagId));
  }
  
  // 应用搜索和排序
  result = applySearchAndSort(result, params, ['title', 'content', 'summary']);
  
  // 应用分页
  return applyPagination(result, params);
};

// 根据ID获取文章
export const getArticleById = (params) => {
  const { id } = params;
  const article = articles.find(a => a.id === id);
  
  if (!article) {
    throw { status: 404, message: 'Article not found' };
  }
  
  // 增加浏览量
  article.views += 1;
  
  return article;
};

// 创建文章
export const createArticle = (params, data) => {
  const newArticle = {
    id: generateId(),
    ...data,
    authorId: getCurrentUserId() || '1',
    likes: 0,
    dislikes: 0,
    commentsCount: 0,
    views: 0,
    isHot: false,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  articles.unshift(newArticle);
  return newArticle;
};

// 更新文章
export const updateArticle = (params, data) => {
  const { id } = params;
  const index = articles.findIndex(a => a.id === id);
  
  if (index === -1) {
    throw { status: 404, message: 'Article not found' };
  }
  
  // 检查权限
  if (!checkPermission(articles[index].authorId)) {
    throw { status: 403, message: 'Permission denied' };
  }
  
  articles[index] = {
    ...articles[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return articles[index];
};

// 删除文章
export const deleteArticle = (params) => {
  const { id } = params;
  const index = articles.findIndex(a => a.id === id);
  
  if (index === -1) {
    throw { status: 404, message: 'Article not found' };
  }
  
  // 检查权限
  if (!checkPermission(articles[index].authorId)) {
    throw { status: 403, message: 'Permission denied' };
  }
  
  articles.splice(index, 1);
  return { success: true };
};

// 发布文章
export const publishArticle = (params) => {
  const { id } = params;
  const article = articles.find(a => a.id === id);
  
  if (!article) {
    throw { status: 404, message: 'Article not found' };
  }
  
  // 检查权限
  if (!checkPermission(article.authorId)) {
    throw { status: 403, message: 'Permission denied' };
  }
  
  article.status = 'published';
  article.publishedAt = new Date().toISOString();
  article.updatedAt = new Date().toISOString();
  
  return article;
};

// 撤回文章
export const unpublishArticle = (params) => {
  const { id } = params;
  const article = articles.find(a => a.id === id);
  
  if (!article) {
    throw { status: 404, message: 'Article not found' };
  }
  
  // 检查权限
  if (!checkPermission(article.authorId)) {
    throw { status: 403, message: 'Permission denied' };
  }
  
  article.status = 'draft';
  article.updatedAt = new Date().toISOString();
  
  return article;
};

// 设置文章热门状态
export const toggleArticleHot = (params) => {
  const { id } = params;
  const article = articles.find(a => a.id === id);
  
  if (!article) {
    throw { status: 404, message: 'Article not found' };
  }
  
  // 只有管理员可以设置热门
  if (!checkPermission('1')) {
    throw { status: 403, message: 'Permission denied' };
  }
  
  article.isHot = !article.isHot;
  article.updatedAt = new Date().toISOString();
  
  return article;
};

// 设置文章精选状态
export const toggleArticleFeatured = (params) => {
  const { id } = params;
  const article = articles.find(a => a.id === id);
  
  if (!article) {
    throw { status: 404, message: 'Article not found' };
  }
  
  // 只有管理员可以设置精选
  if (!checkPermission('1')) {
    throw { status: 403, message: 'Permission denied' };
  }
  
  article.isFeatured = !article.isFeatured;
  article.updatedAt = new Date().toISOString();
  
  return article;
};

// 获取作者的文章列表
export const getAuthorArticles = (params) => {
  const { id: authorId } = params;
  let result = articles.filter(article => article.authorId === authorId);
  
  // 如果不是作者本人，只返回已发布的文章
  const currentUserId = getCurrentUserId();
  if (currentUserId !== authorId) {
    result = result.filter(article => article.status === 'published');
  }
  
  // 应用搜索和排序
  result = applySearchAndSort(result, params, ['title', 'content', 'summary']);
  
  // 应用分页
  return applyPagination(result, params);
};