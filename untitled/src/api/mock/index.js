// Mock 数据管理和API拦截配置
import { generateDelay, generateRandomError, generateId, applyPagination, applySearchAndSort } from './utils';
import * as users from './users';
import * as articles from './article-apis';
import * as categories from './categories';
import * as tags from './tags';
import * as comments from './comments';
import * as files from './file-apis';

// 导出所有mock数据
const mockData = {
  users: users.users,
  articles: articles.articles,
  categories: categories.categories,
  tags: tags.tags,
  comments: comments.comments,
  files: files.files
};

// API 路由映射
const apiRoutes = {
  // 用户相关路由
  'GET /users/login': users.login,
  'POST /users/register': users.register,
  'GET /users/me': users.getCurrentUser,
  'PUT /users/me': users.updateProfile,
  'PUT /users/me/password': users.updatePassword,
  'POST /users/logout': users.logout,
  
  // 文章相关路由
  'GET /articles': articles.getArticles,
  'GET /articles/:id': articles.getArticleById,
  'POST /articles': articles.createArticle,
  'PUT /articles/:id': articles.updateArticle,
  'DELETE /articles/:id': articles.deleteArticle,
  'POST /articles/:id/publish': articles.publishArticle,
  'POST /articles/:id/unpublish': articles.unpublishArticle,
  'POST /articles/:id/hot': articles.toggleArticleHot,
  'POST /articles/:id/featured': articles.toggleArticleFeatured,
  'GET /users/:id/articles': articles.getAuthorArticles,
  
  // 分类相关路由
  'GET /categories': categories.getAllCategories,
  'GET /categories/flat': categories.getFlatCategories,
  'GET /categories/:id': categories.getCategoryById,
  'POST /categories': categories.createCategory,
  'PUT /categories/:id': categories.updateCategory,
  'DELETE /categories/:id': categories.deleteCategory,
  
  // 标签相关路由
  'GET /tags': tags.getAllTags,
  'GET /tags/popular': tags.getPopularTags,
  'GET /tags/:id': tags.getTagById,
  'POST /tags': tags.createTag,
  'PUT /tags/:id': tags.updateTag,
  'DELETE /tags/:id': tags.deleteTag,
  
  // 评论相关路由
  'GET /articles/:id/comments': comments.getArticleComments,
  'POST /comments': comments.createComment,
  'PUT /comments/:id': comments.updateComment,
  'DELETE /comments/:id': comments.deleteComment,
  'POST /comments/:id/like': comments.toggleCommentLike,
  'GET /comments': comments.getComments,
  'GET /comments/:id': comments.getCommentById,
  'DELETE /comments/batch': comments.batchDeleteComments,
  'POST /comments/:id/unlike': comments.unlikeComment,
  'PUT /comments/:id/moderate': comments.moderateComment,
  'PUT /comments/batch/moderate': comments.batchModerateComments,
  'GET /comments/stats': comments.getCommentStats,
  'GET /comments/popular': comments.getPopularComments,
  'GET /comments/recent': comments.getRecentComments,
  
  // 文件管理相关路由
  'GET /files': files.getFiles,
  'GET /files/:id': files.getFileById,
  'POST /files/upload': files.uploadFile,
  'POST /files/batch-upload': files.batchUploadFiles,
  'DELETE /files/:id': files.deleteFile,
  'POST /files/batch-delete': files.batchDeleteFiles,
  'PUT /files/:id': files.updateFile,
  'GET /files/stats': files.getFileStats,
  'GET /files/categories': files.getFileCategories,
  'GET /files/search': files.searchFiles,
  'GET /files/popular': files.getPopularFiles,
  'POST /files/check-exists': files.checkFileExists,
  'GET /files/:id/preview': files.getFilePreviewUrl,
  'GET /files/export': files.exportFileList,
  'GET /files/:id/download': files.downloadFile,
  'POST /files/batch-download': files.batchDownloadFiles
};

// 模拟API响应函数
export async function mockApiResponse(method, url, params, data) {
  // 模拟网络延迟
  await generateDelay();
  
  // 随机生成错误（5%的概率）
  const randomError = generateRandomError(0.05);
  if (randomError) {
    throw randomError;
  }
  
  // 查找匹配的路由处理函数
  let handler;
  let routeKey = `${method.toUpperCase()} ${url}`;
  
  // 尝试精确匹配
  if (apiRoutes[routeKey]) {
    handler = apiRoutes[routeKey];
  } else {
    // 尝试参数化路由匹配
    for (const [pattern, routeHandler] of Object.entries(apiRoutes)) {
      if (pattern.includes(':')) {
        const patternParts = pattern.split(' ');
        const urlParts = routeKey.split(' ');
        
        if (patternParts[0] === urlParts[0]) {
          const pathRegex = new RegExp(patternParts[1].replace(/:\w+/g, '\\w+'));
          if (pathRegex.test(urlParts[1])) {
            handler = routeHandler;
            // 提取路由参数
            const paramMatches = urlParts[1].match(new RegExp(patternParts[1].replace(/:\w+/g, '(\\w+)')));
            const paramNames = [...patternParts[1].matchAll(/:(\w+)/g)].map(match => match[1]);
            
            if (paramMatches && paramNames.length > 0) {
              paramNames.forEach((name, index) => {
                params[name] = paramMatches[index + 1];
              });
            }
            break;
          }
        }
      }
    }
  }
  
  // 如果找到处理函数，则调用
  if (handler) {
    try {
      return handler(params, data);
    } catch (error) {
      console.error('Mock API error:', error);
      throw {
        status: 500,
        message: error.message || 'Internal Server Error'
      };
    }
  }
  
  // 未找到匹配的路由
  throw {
    status: 404,
    message: 'Not Found'
  };
}

// 导出工具函数
export {
  generateDelay,
  generateRandomError,
  generateId,
  applyPagination,
  applySearchAndSort,
  mockData
};